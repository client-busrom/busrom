const CMS_URL = 'https://cms.busromhouse.com/api/graphql';
const SESSION_COOKIE = process.env.CMS_SESSION_COOKIE;

async function graphqlRequest(query, variables = {}) {
  const response = await fetch(CMS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: SESSION_COOKIE,
    },
    body: JSON.stringify({ query, variables }),
  });
  return response.json();
}

async function main() {
  // 查询剩余的 NavigationMenu
  const result = await graphqlRequest('{ navigationMenus { id label parent { id } } }');
  console.log('完整响应:', JSON.stringify(result, null, 2));
  console.log('剩余菜单:', JSON.stringify(result.data?.navigationMenus, null, 2));

  const menus = result.data?.navigationMenus || [];

  console.log('\n开始删除...');
  for (const menu of menus) {
    const del = await graphqlRequest(
      'mutation($id: ID!) { deleteNavigationMenu(where: { id: $id }) { id } }',
      { id: menu.id }
    );
    if (del.data?.deleteNavigationMenu) {
      console.log('✅ 已删除:', menu.label);
    } else {
      console.log('❌ 删除失败:', menu.label);
      console.log('   错误:', JSON.stringify(del.errors));
    }
  }
}

main();
