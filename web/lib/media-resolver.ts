import { convertToCDNUrl } from "./cdn-url";

/**
 * 递归扫描 Lexical 内容中的媒体 ID 和案例 ID
 */
export const resolveAllMedia = async (content: any, cmsUrl: string, normalize: (url: string) => string) => {
  const mediaIds = new Set<string>();
  const applicationIds = new Set<string>();
  const mediaData: Record<string, any> = {};

  const extractId = (val: any): string | null => {
    if (!val) return null;
    if (typeof val === 'string' || typeof val === 'number') return String(val);
    if (typeof val === 'object' && val.id) return String(val.id);
    return null;
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
    const mediaFields = ['image', 'icon', 'media', 'backgroundImage', 'mainImage'];
    mediaFields.forEach(f => {
      const id = extractId(node[f]);
      if (id) mediaIds.add(id);
    });

    // 提取案例关联 ID (针对自定义块)
    if (node.application) {
      const id = extractId(node.application);
      if (id) applicationIds.add(id);
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

  // 2. 解析案例图集：去案例库里随机捡一张图
  if (applicationIds.size > 0) {
    const appPromises = Array.from(applicationIds).map(async (id) => {
      try {
        const res = await fetch(`${cmsUrl}/api/applications/${id}`);
        if (res.ok) {
          const appDoc = await res.json();
          const allSceneImages: any[] = [];
          
          // 逻辑核心：遍历 sceneGallery 里的每一场图片，打平到一个池子里
          if (Array.isArray(appDoc.sceneGallery)) {
            appDoc.sceneGallery.forEach((scene: any) => {
              if (Array.isArray(scene.images)) {
                scene.images.forEach((img: any) => {
                  if (img) allSceneImages.push(img);
                });
              }
            });
          }

          let selectedImage: any = null;
          if (allSceneImages.length > 0) {
            // 💡 随机之选
            selectedImage = allSceneImages[Math.floor(Math.random() * allSceneImages.length)];
          } else {
            // 兜底：主图
            selectedImage = appDoc.mainImage || appDoc.image;
          }

          const selectedImageId = extractId(selectedImage);
          if (selectedImageId) {
            mediaIds.add(selectedImageId);
            appToImageId[id] = selectedImageId;
          }
        }
      } catch (err) {
        console.error(`[MediaResolver] Application ${id} fetch error:`, err);
      }
    });
    await Promise.all(appPromises);
  }

  // 3. 批量拉取所有真实的媒体元数据
  if (mediaIds.size > 0) {
    const uniqueIds = Array.from(mediaIds);
    await Promise.all(uniqueIds.map(async (id) => {
      try {
        const res = await fetch(`${cmsUrl}/api/media/${id}`);
        if (res.ok) {
          const doc = await res.json();
          // transform & normalize
          mediaData[id] = {
            ...doc,
            id: String(doc.id),
            url: doc.url ? normalize(doc.url) : '',
            variants: doc.sizes ? Object.fromEntries(
              Object.entries(doc.sizes).map(([k, v]: [string, any]) => [k, { ...v, url: normalize(v.url) }])
            ) : {}
          };
        }
      } catch (err) {
        console.error(`[MediaResolver] Media ${id} fetch error:`, err);
      }
    }));

    // 4. 将案例映射关系回灌到 mediaData
    Object.entries(appToImageId).forEach(([appId, imageId]) => {
      if (mediaData[imageId]) {
        mediaData[appId] = { ...mediaData[imageId], id: appId };
      }
    });
  }

  return { content, mediaData };
};
