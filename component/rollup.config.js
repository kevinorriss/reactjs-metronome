import babel from "@rollup/plugin-babel"
import { terser } from "rollup-plugin-terser"
import { string } from "rollup-plugin-string"
import postcss from "rollup-plugin-postcss"

const config = {
    input: 'src/Metronome.js',
    external: ['react', 'prop-types', 'rc-slider', '@fortawesome/react-fontawesome', '@fortawesome/free-solid-svg-icons', 'rc-slider/assets/index.css'],
    plugins: [
        postcss({ extensions: ['.css'] }),
        babel({ exclude: '/node_modules/', babelHelpers: 'bundled' }),
        string({ include: "**/MetronomeWorker.js" }),
        terser()
    ],
    output: {
        format: 'umd',
        name: 'metronome',
        globals: {
            'react': 'React',
            'prop-types': 'PropTypes',
            'rc-slider': 'rc-slider',
            '@fortawesome/react-fontawesome': '@fortawesome/react-fontawesome',
            '@fortawesome/free-solid-svg-icons': '@fortawesome/free-solid-svg-icons'
        }
    }
}
export default config