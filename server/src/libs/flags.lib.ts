function flags(...flags: string[]): Array<boolean | string> {
  const result: Array<boolean | string> = [];

  const argv = process.argv;

  flags.forEach((flag) => {
    const index = argv.indexOf(flag);
    const nextArg = argv[index + 1];

    if (index === -1) {
      result.push(false);
      return;
    }

    if (!nextArg) {
      result.push(true);
      return;
    }

    if (nextArg.startsWith("-")) {
      result.push(true);
      return;
    }

    result.push(nextArg);
  });

  return result;
}

export default flags;
