
// eslint-disable-next-line
require('@babel/register')({
    cache: false,
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    plugins: ['@babel/proposal-class-properties'],
    presets: [
        [
            '@babel/preset-env',
            {
                targets: {
                    node: 'current',
                },
            },
        ],
        '@babel/preset-react',
        '@babel/preset-typescript',
    ],
});