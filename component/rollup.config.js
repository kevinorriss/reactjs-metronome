import babel from 'rollup-plugin-babel'
import { uglify } from 'rollup-plugin-uglify'
import postcss from 'rollup-plugin-postcss'
import url from 'rollup-plugin-url'

const config = {
    input: 'src/Metronome.js',
    external: ['react'],
    plugins: [
        url({
            include: ["**/*.mp3"]
        }),
        postcss({
            extensions: ['.css']
        }),
        babel({
            exclude: "node_modules/**"
        }),
        uglify()
    ],
    output: {
        format: 'umd',
        name: 'metronome',
        globals: {
            react: "React"
        }
    }
}
export default config