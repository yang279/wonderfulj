const { init, resolve } = require('./core');

async function main() {
  init();

  const testInput = require('./test-input.json');
  console.log('输入:', JSON.stringify(testInput, null, 2));

  const result = await resolve(testInput);
  console.log('\n输出:', JSON.stringify(result, null, 2));
}

main().catch(err => console.error(err));