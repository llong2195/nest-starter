module.exports = {
  '*.ts|js': (files) => {
    const cmds = [`npm run format --files=${files.join(',')}`];
    return cmds;
  },
};
