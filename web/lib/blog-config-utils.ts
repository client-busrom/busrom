/**
 * Resolves the effective configuration for a blog module by prioritizing 
 * Individual Overrides/Disables over Global Settings.
 */
export const resolveModuleConfig = (
  blog: any,
  globalConfig: any,
  localKey: string,
  globalKey: string,
  templateId: string
) => {
  const global = globalConfig?.[globalKey] || {};
  
  // 1. Determine mode
  // Look for both flattened and potentially nested switch
  const masterSwitch = !!(blog.useCustomOverrides || blog.kb_overrides?.useCustomOverrides);
  let mode = masterSwitch ? (blog[`kb_${localKey}_mode`] || blog.kb_overrides?.[`${localKey}_mode`] || "inherit") : "inherit";

  // 2. Individual DISABLE
  if (mode === "disable") {
    return { enabled: false };
  }

  // 3. Individual OVERRIDE
  if (mode === "override") {
    const localConfig: any = { enabled: true };
    const prefix = `kb_${localKey}_`;

    // Strategy A: Flattened fields (e.g. blog.kb_pagination_type)
    Object.keys(blog).forEach(key => {
      if (key.startsWith(prefix)) {
        const targetKey = key.substring(prefix.length);
        if (targetKey !== "mode") {
          localConfig[targetKey] = blog[key];
        }
      }
    });

    // Strategy B: Nested object fields (e.g. blog.kb_pagination.type)
    const nested = blog[prefix.slice(0, -1)]; // remove trailing underscore
    if (nested && typeof nested === 'object') {
      Object.keys(nested).forEach(key => {
        if (key !== "mode") {
          localConfig[key] = nested[key];
        }
      });
    }

    return { ...global, ...localConfig };
  }

  // 4. INHERIT (Default)
  const isGlobalEnabledForThisTemplate = !!(
    global?.enabled && 
    (global?.templates?.includes(templateId) || !global?.templates || global?.templates?.length === 0)
  );

  return {
    ...global,
    enabled: isGlobalEnabledForThisTemplate,
    type: global.type || "auto",
  };
};
