async function check() {
  const r = await fetch('https://school-management-mauve-phi.vercel.app/assets/index-BlAaVjXh.js');
  const t = await r.text();
  console.log('Has uzlu.onrender.com:', t.includes('uzlu.onrender.com'));
  console.log('Has school-management-uzlu:', t.includes('school-management-uzlu'));
}
check();
