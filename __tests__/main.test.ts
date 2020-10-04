import { run } from '../src/pg-rls-util';

describe.skip('greeter function', () => {
  let result: any;

  // Act before assertions
  beforeAll(async () => {
    result = await run()
  });

  // Assert if setTimeout was called properly
  it('runs the thing', () => {
    console.log(result)
  });

});
