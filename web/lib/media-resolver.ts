import { convertToCDNUrl } from "./cdn-url";
import { getRandomAppImage } from "./image-utils";

/**
 * 递归扫描 Lexical 内容中的媒体 ID 和案例 ID
 */
export const resolveAllMedia = async (content: any, cmsUrl: string, normalize: (url: string) => string) => {
  const mediaIds = new Set<string>();
  const applicationIds = new Set<string>();
  const mediaData: Record<string, any> = {};

  const extractId = (val: any): string | null => {
    if (!val) return null;
    let id: string = "";
    
    if (typeof val === 'string' || typeof val === 'number') {
      id = String(val);
    } else if (typeof val === 'object' && val.id) {
      id = String(val.id);
    } else {
      return null;
    }

    // Filter out obvious non-ID strings that cause 500 errors in Payload/Postgres
    // 1. Icon identifiers (contain colons like 'lucide:user')
    if (id.includes(':')) return null;
    // 2. Common markers or field names accidentally passed as values
    const blacklisted = ['image', 'icon', 'media', 'none', 'null', 'undefined', 'true', 'false'];
    if (blacklisted.includes(id.toLowerCase())) return null;
    // 3. If the ID is purely non-alphanumeric and not a number, it's likely garbage
    if (!/^[a-zA-Z0-9_\-]+$/.test(id)) return null;

    return id;
  };

  // 1. 深度递归扫描：收集所有常规媒体 ID 和案例 (Application) ID
  const scanAndNormalize = (node: any) => {
    if (!node || typeof node !== 'object') return;

    // 纠偏所有已存在的 URL (针对 CMS 已经水合的数据)
    if (typeof node.url === 'string' && node.url.startsWith('/')) {
      node.url = normalize(node.url);
    }
    if (node.sizes && typeof node.sizes === 'object') {
       Object.values(node.sizes).forEach((sizeObj: any) => {
         if (sizeObj && typeof sizeObj.url === 'string' && sizeObj.url.startsWith('/')) {
           sizeObj.url = normalize(sizeObj.url);
         }
       });
    }

    // 提取媒体 ID
    const mediaFields = ['image', 'icon', 'media', 'backgroundImage', 'mainImage', 'showImage', 'featuredImage', 'bgImage', 'logo', 'avatar'];
    mediaFields.forEach(f => {
      const id = extractId(node[f]);
      if (id) mediaIds.add(id);
    });

    // 提取案例关联 ID (针对自定义块)
    if (node.application) {
      const id = extractId(node.application);
      if (id) applicationIds.add(id);
    }
    // Handle array of applications (e.g. in applicationCarousel)
    if (node.applications && Array.isArray(node.applications)) {
      node.applications.forEach((app: any) => {
        const id = extractId(app);
        if (id) applicationIds.add(id);
      });
    }
    // Also handle applicationIds field occasionally used
    if (node.applicationIds && Array.isArray(node.applicationIds)) {
      node.applicationIds.forEach((id: any) => {
        const extracted = extractId(id);
        if (extracted) applicationIds.add(extracted);
      });
    }

    // 递归处理数组和对象
    Object.keys(node).forEach(key => {
      const val = node[key];
      if (key === 'url' || key === 'mediaData') return;
      if (Array.isArray(val)) {
        val.forEach(item => scanAndNormalize(item));
      } else if (typeof val === 'object' && val !== null && key !== 'parent') {
        scanAndNormalize(val);
      }
    });
  };

  scanAndNormalize(content);

  const appToImageId: Record<string, string> = {};

  // 2. 解析案例图集：去案例库里批量拉取元数据并随机捡图
  if (applicationIds.size > 0) {
    try {
      const idsArr = Array.from(applicationIds);
      const query = idsArr.map(id => `where[id][in]=${id}`).join('&');
      // Payload typically allows many 'in' filters or we can use a single array if the API supports it
      // Standard Payload REST way: where[id][in][]=id1&where[id][in][]=id2
      const queryString = idsArr.map(id => `where[id][in][]=${id}`).join('&');
      
      const res = await fetch(`${cmsUrl}/api/applications?${queryString}&limit=100&depth=1`, {
        next: { revalidate: 3600 }
      });
      if (res.ok) {
        const data = await res.json();
        const docs = data.docs || [];
        
        docs.forEach((appDoc: any) => {
          const id = String(appDoc.id);
          
          // Use the standardized Double-Random selector
          const selectedImage = getRandomAppImage(appDoc);

          const selectedImageId = extractId(selectedImage);
          if (selectedImageId) {
            mediaIds.add(selectedImageId);
            appToImageId[id] = selectedImageId;
            // 如果 selectedImage 是完整对象且已填充，可以直接存入
            if (typeof selectedImage === 'object' && selectedImage.url) {
              mediaData[selectedImageId] = {
                ...selectedImage,
                id: String(selectedImage.id),
                url: normalize(selectedImage.url),
                variants: selectedImage.sizes ? Object.fromEntries(
                  Object.entries(selectedImage.sizes).map(([k, v]: [string, any]) => [k, { ...v, url: normalize(v.url) }])
                ) : {}
              };
            }
          }
        });
      }
    } catch (err) {
      console.error(`[MediaResolver] Batch Applications fetch error:`, err);
    }
  }

  // 3. 批量拉取所有真实的媒体元数据
  // 排除掉已经在应用步骤里获取到的媒体
  const missingMediaIds = Array.from(mediaIds).filter(id => !mediaData[id]);
  
  if (missingMediaIds.length > 0) {
    // 分片处理，防止 URL 过长 (每 50 个一组)
    const chunkSize = 50;
    for (let i = 0; i < missingMediaIds.length; i += chunkSize) {
      const chunk = missingMediaIds.slice(i, i + chunkSize);
      try {
        const queryString = chunk.map(id => `where[id][in][]=${id}`).join('&');
        const res = await fetch(`${cmsUrl}/api/media?${queryString}&limit=${chunkSize}&depth=1`, {
          next: { revalidate: 3600 }
        });
        if (res.ok) {
          const data = await res.json();
          (data.docs || []).forEach((doc: any) => {
            const id = String(doc.id);
            mediaData[id] = {
              ...doc,
              url: doc.url ? normalize(doc.url) : '',
              variants: doc.sizes ? Object.fromEntries(
                Object.entries(doc.sizes).map(([k, v]: [string, any]) => [k, { ...v, url: normalize(v.url) }])
              ) : {}
            };
          });
        }
      } catch (err) {
        console.error(`[MediaResolver] Batch Media fetch error:`, err);
      }
    }
  }

  // 4. 将案例映射关系回灌到 mediaData
  Object.entries(appToImageId).forEach(([appId, imageId]) => {
    if (mediaData[imageId]) {
      mediaData[appId] = { ...mediaData[imageId], id: appId };
    }
  });

  return { content, mediaData, products: Array.isArray(content) ? content : undefined };
};

/**
 * 递归将内容树中的媒体 ID 替换为 mediaData 中的完整对象
 */
export const hydrateContent = (node: any, mediaData: Record<string, any>) => {
  if (!node || typeof node !== 'object') return node;

  if (Array.isArray(node)) {
    return node.map(item => hydrateContent(item, mediaData));
  }

  const newNode = { ...node };
  const mediaFields = ['image', 'icon', 'media', 'backgroundImage', 'mainImage', 'showImage', 'featuredImage', 'bgImage', 'logo', 'avatar'];

  mediaFields.forEach(f => {
    const val = newNode[f];
    if (val) {
      const id = typeof val === 'object' ? val.id : val;
      if (id && mediaData[id]) {
        newNode[f] = mediaData[id];
      }
    }
  });

  // Handle data/fields objects common in Lexical blocks
  if (newNode.data) newNode.data = hydrateContent(newNode.data, mediaData);
  if (newNode.fields) newNode.fields = hydrateContent(newNode.fields, mediaData);

  // Recursively handle all other object properties
  Object.keys(newNode).forEach(key => {
    if (['data', 'fields', 'image', 'icon', 'media', 'backgroundImage', 'mainImage', 'showImage', 'featuredImage', 'bgImage', 'logo', 'avatar', 'parent'].includes(key)) return;
    if (typeof newNode[key] === 'object' && newNode[key] !== null) {
      newNode[key] = hydrateContent(newNode[key], mediaData);
    }
  });

  return newNode;
};
