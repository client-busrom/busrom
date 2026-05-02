async function getForms() {
  const baseUrl = 'http://localhost:3002/api';
  const results = [];

  async function fetchJson(url) {
    try {
      const res = await fetch(url);
      if (!res.ok) return null;
      return await res.json();
    } catch (e) {
      return null;
    }
  }

  // Helper to find form blocks in Lexical
  function findFormBlocks(node) {
    if (!node) return [];
    let found = [];
    if (node.type === 'formBlock') {
      found.push(node.data?.formConfig?.id || node.data?.formConfig);
    }
    if (node.children) {
      for (const child of node.children) {
        found = found.concat(findFormBlocks(child));
      }
    }
    if (node.root) {
       found = found.concat(findFormBlocks(node.root));
    }
    return found;
  }

  // 0. Fetch all form configs for lookup
  const formConfigs = await fetchJson(`${baseUrl}/form-configs?limit=100`);
  const formMap = {};
  if (formConfigs && formConfigs.docs) {
    formConfigs.docs.forEach(f => {
      formMap[f.id] = f.name;
    });
  }

  // 1. Pages (其他子页)
  const pagesData = await fetchJson(`${baseUrl}/pages?limit=100`);
  if (pagesData && pagesData.docs) {
    pagesData.docs.forEach(doc => {
      const formIds = findFormBlocks(doc.contentTranslation);
      if (formIds.length > 0) {
        formIds.forEach(id => {
          results.push({
            category: '其他子页 (Subpages)',
            name: doc.title,
            slug: doc.slug,
            route: `/[locale]${doc.path || '/' + doc.slug}`,
            formName: formMap[id] || `Form ID: ${id}`
          });
        });
      } else if (doc.slug !== 'privacy-policy') {
         // User says 10 out of 11 have forms. Maybe I'm missing some block types.
         // Let's check if there are other fields or nested blocks.
         results.push({
            category: '其他子页 (Subpages)',
            name: doc.title,
            slug: doc.slug,
            route: `/[locale]${doc.path || '/' + doc.slug}`,
            formName: 'NOT_FOUND_IN_API (Check manually)'
          });
      }
    });
  }

  // 2. Products (产品详解页)
  const productsData = await fetchJson(`${baseUrl}/products?limit=100`);
  if (productsData && productsData.docs) {
    // Only one form for all products or specific?
    // User said "产品详解页有一个表单"
    // Let's find products with linkedForm
    const productsWithForms = productsData.docs.filter(p => p.linkedForm);
    if (productsWithForms.length > 0) {
       const p = productsWithForms[0];
       const id = p.linkedForm.id || p.linkedForm;
       results.push({
         category: '产品详解页 (Product Detail)',
         name: 'All Products (with linkedForm)',
         route: '/[locale]/products/[slug] and /[locale]/shop/[slug]',
         formName: formMap[id] || `Form ID: ${id}`
       });
    }
  }

  // 3. Product Series (产品链接页)
  const seriesData = await fetchJson(`${baseUrl}/product-series?limit=100`);
  // User said "产品链接页有一个表单"
  // Maybe it's linked in the template or seriesTemplate.
  // Let's check SeriesTemplates
  const seriesTemplates = await fetchJson(`${baseUrl}/series-templates?limit=100`);
  if (seriesTemplates && seriesTemplates.docs) {
     seriesTemplates.docs.forEach(t => {
       const formIds = findFormBlocks(t.content);
       if (formIds.length > 0) {
         formIds.forEach(id => {
            results.push({
              category: '产品链接页 (Product Series)',
              name: `Template: ${t.name}`,
              route: '/[locale]/products/series/[slug]',
              formName: formMap[id] || `Form ID: ${id}`
            });
         });
       }
     });
  }

  // 4. Globals
  const mainForm = await fetchJson(`${baseUrl}/globals/main-form`);
  if (mainForm && mainForm.formConfig) {
    const id = mainForm.formConfig.id || mainForm.formConfig;
    results.push({
      category: '首页 (Homepage)',
      name: 'Main Form',
      route: '/[locale]',
      formName: formMap[id] || `Form ID: ${id}`
    });
  }

  const footer = await fetchJson(`${baseUrl}/globals/footer`);
  if (footer && footer.formConfig) {
    const id = footer.formConfig.id || footer.formConfig;
    results.push({
      category: '页脚 (Footer)',
      name: 'Footer Form',
      route: 'All Pages (Common Footer)',
      formName: formMap[id] || `Form ID: ${id}`
    });
  }

  console.log(JSON.stringify(results, null, 2));
}

getForms();
