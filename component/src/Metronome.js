import React from 'react'
import PropTypes from 'prop-types'
import Slider from 'rc-slider'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlay, faPause, faPlus, faMinus } from '@fortawesome/free-solid-svg-icons'
import metronomeWorker from './MetronomeWorker.js'
import 'rc-slider/assets/index.css'
import './styles.css'

class Metronome extends React.Component {
    constructor(props) {
        super()
        
        const startBpm = props.startBpm ?? 100

        // instance variables
        this.minBpm = props.minBpm ?? 40
        this.maxBpm = props.maxBpm ?? 200
        this.volume = props.volume ?? 0.1
        this.frequency = props.frequency ?? 440.0
        this.audioContext = undefined
        this.volumeNode = undefined
        this.nextNoteTime = 0.0
        this.timerWorker = undefined
        this.secondsPerBeat = 60.0 / startBpm

        this.playPauseStyle = props.playPauseStyle ?? {}
        this.bpmStyle = props.bpmStyle ?? {}
        this.bpmTagStyle = props.bpmTagStyle ?? {}
        this.plusStyle = props.plusStyle ?? {}
        this.minusStyle = props.minusStyle ?? {}
        this.handleStyle = props.handleStyle ?? {}
        this.trackStyle = props.trackStyle ?? {}
        this.railStyle = props.railStyle ?? {}
        this.sliderStyle = props.sliderStyle ?? {}

        // initial state
        this.state = {
            bpm: startBpm,
            playing: false
        }

        this.initAudio = this.initAudio.bind(this)
        this.handlePlayPause = this.handlePlayPause.bind(this)
        this.handleDecrement = this.handleDecrement.bind(this)
        this.handleIncrement = this.handleIncrement.bind(this)
        this.handleChange = this.handleChange.bind(this)
        this.tick = this.tick.bind(this)
    }

    componentDidMount() {
        // create a worker which runs an interval on a separate thread calling the tick function
        this.timerWorker = new Worker(window.URL.createObjectURL(new Blob([metronomeWorker])))

        // setup the listener for the tick message
        this.timerWorker.onmessage = ({ data }) => { data === "tick" && tick() }

        // set the interval on the worker
        this.timerWorker.postMessage({message: "interval", interval: 25.0})
    }

    componentWillUnmount() {
        // tell the worker to stop and close itself, rather than calling terminate from this scope
        this.timerWorker.postMessage({message: "close"})
    }

    // creates the audio context and buffer, sets the volume and starts playing
    initAudio() {
        // create the audio context
        this.audioContext = new AudioContext()

        this.volumeNode = this.audioContext.createGain()
        this.volumeNode.gain.value = this.volume
        this.volumeNode.connect(this.audioContext.destination)

        // create a buffer source and add the buffer
        var source = this.audioContext.createBufferSource()
        source.buffer = this.audioContext.createBuffer(1, 1, 22050)

        // start playing the audio data immediately
        source.start(0)
    }

    handlePlayPause() {
        // if the audio context hasn't been created, we need to set it up
        // we must create the audio context after a user gesture (browser autoplay policy)
        if (this.audioContext == null) {
            this.initAudio()
        }

        // start or stop the interval loop in the worker
        this.timerWorker.postMessage({message: !this.state.playing ? "start" : "stop" })

        // update the state so the play/pause icon re-renders
        this.setState((prevState) => ({
            ...prevState,
            playing: !prevState.playing
        }))
    }

    // event handlers for changing the BPM, clamps the value between MIN/MAX
    handleDecrement() { this.handleChange(this.state.bpm-1) }
    handleIncrement() { this.handleChange(this.state.bpm+1) }
    handleChange(newBpm) {
        if (newBpm < this.minBpm || newBpm > this.maxBpm) return
        this.setState((prevState) => ({
            ...prevState,
            bpm: newBpm
        }), ()=> {
            this.secondsPerBeat = 60.0 / this.state.bpm
        })
    }
    
    // fired when a tick message is received from the interval worker (only when playing)
    tick() {
        // when it is time to schedule a note to play
        // we use while becuase audioContext time is incrementing even when paused
        // so we loop until the nextNoteTime catches up
        while (this.nextNoteTime < this.audioContext.currentTime + 0.1 ) {
        
            // create an oscillator which generates a constant tone (a beep)
            var osc = this.audioContext.createOscillator()
            osc.connect( this.volumeNode )
            osc.frequency.value = frequency
        
            // start the beep at the next note time
            osc.start( this.nextNoteTime )

            // stop the beep after at the note length
            osc.stop( this.nextNoteTime + 0.075 )
            
            // calculate the time of the next note
            this.nextNoteTime += this.secondsPerBeat
        }
    }

    render() {
        return (
            <div className="metronome">
                <div className="metronome__top">
                    <div className="metronome__bpm">
                        <h1 style={this.bpmStyle}>{this.state.bpm}</h1>
                        <small style={this.bpmTagStyle}>BPM</small>
                    </div>
                    <div className="metronome__play-pause" onClick={this.handlePlayPause} style={this.playPauseStyle} >
                        <FontAwesomeIcon icon={this.state.playing ? faPause : faPlay} />
                    </div>
                </div>
                <div className="metronome__slider" style={this.sliderStyle}>
                    <div className="slider__button slider__button--minus" onClick={this.handleDecrement} style={this.minusStyle}>
                        <FontAwesomeIcon icon={faMinus} />
                    </div>
                    <Slider
                        min={this.minBpm}
                        max={this.maxBpm}
                        step={1}
                        value={this.state.bpm}
                        onChange={this.handleChange}
                        trackStyle={this.trackStyle}
                        handleStyle={this.handleStyle}
                        railStyle={this.railStyle} />
                    <div className="slider__button slider__button--plus" onClick={this.handleIncrement} style={this.plusStyle}>
                        <FontAwesomeIcon icon={faPlus} />
                    </div>
                </div>
            </div>
        )
    }
}

/*
const Metronome = ({ minBpm=40, maxBpm=200, startBpm=100, volume=0.1, frequency=440.0, ...props }) => {

    // state variables
    const [bpm, setBpm] = useState(startBpm)
    const [playing, setPlaying] = useState(false)

    // instance variables
    const audioContext = useRef()
    const volumeNode = useRef()
    const nextNoteTime = useRef(0.0)
    const timerWorker = useRef()
    const secondsPerBeat = useRef(60.0 / (startBpm))

    // componentWillMount
    useEffect(() => {
        // create a worker which runs an interval on a separate thread calling the tick function
        timerWorker.current = new Worker(window.URL.createObjectURL(new Blob([metronomeWorker])))

        // setup the listener for the tick message
        timerWorker.current.onmessage = ({ data }) => { data === "tick" && tick() }

        // set the interval on the worker
        timerWorker.current.postMessage({message: "interval", interval: 25.0})

        // componentWillUnmount
        return () => {
            // tell the worker to stop and close itself, rather than calling terminate from this scope
            timerWorker.current.postMessage({message: "close"})
        }
    }, []) 

    // calculate the seconds per beat with the BPM changes
    useEffect(() => { secondsPerBeat.current = 60.0 / bpm }, [bpm])

    // creates the audio context and buffer, sets the volume and starts playing
    const initAudio = () => {
        // create the audio context
        audioContext.current = new AudioContext()

        volumeNode.current = audioContext.current.createGain()
        volumeNode.current.gain.value = volume
        volumeNode.current.connect(audioContext.current.destination)

        // create a buffer source and add the buffer
        var source = audioContext.current.createBufferSource()
        source.buffer = audioContext.current.createBuffer(1, 1, 22050)

        // start playing the audio data immediately
        source.start(0)
    }

    const handlePlayPause = () => {
        // if the audio context hasn't been created, we need to set it up
        // we must create the audio context after a user gesture (browser autoplay policy)
        if (audioContext.current == null) {
            initAudio()
        }

        // start or stop the interval loop in the worker
        timerWorker.current.postMessage({message: !playing ? "start" : "stop" })

        // update the state so the play/pause icon re-renders
        setPlaying(!playing)
    }

    // event handlers for changing the BPM, clamps the value between MIN/MAX
    const handleDecrement = () => { handleChange(bpm-1) }
    const handleIncrement = () => { handleChange(bpm+1) }
    const handleChange = (newBpm) => {
        if (newBpm < minBpm || newBpm > maxBpm) return
        setBpm(newBpm)
    }
    
    // fired when a tick message is received from the interval worker (only when playing)
    const tick = () => {
        // when it is time to schedule a note to play
        // we use while becuase audioContext time is incrementing even when paused
        // so we loop until the nextNoteTime catches up
        while (nextNoteTime.current < audioContext.current.currentTime + 0.1 ) {
        
            // create an oscillator which generates a constant tone (a beep)
            var osc = audioContext.current.createOscillator()
            osc.connect( volumeNode.current )
            osc.frequency.value = frequency
        
            // start the beep at the next note time
            osc.start( nextNoteTime.current )

            // stop the beep after at the note length
            osc.stop( nextNoteTime.current + 0.075 )
            
            // calculate the time of the next note
            nextNoteTime.current += secondsPerBeat.current
        }
    }

    // render
    return (
        <div className="metronome">
            <div className="metronome__top">
                <div className="metronome__bpm">
                    <h1 style={props.bpmStyle}>{bpm}</h1>
                    <small style={props.bpmTagStyle}>BPM</small>
                </div>
                <div className="metronome__play-pause" onClick={handlePlayPause} style={props.playPauseStyle} >
                    <FontAwesomeIcon icon={playing ? faPause : faPlay} />
                </div>
            </div>
            <div className="metronome__slider" style={props.sliderStyle}>
                <div className="slider__button slider__button--minus" onClick={handleDecrement} style={props.minusStyle}>
                    <FontAwesomeIcon icon={faMinus} />
                </div>
                <Slider
                    min={minBpm}
                    max={maxBpm}
                    step={1}
                    value={bpm}
                    onChange={handleChange}
                    trackStyle={props.trackStyle}
                    handleStyle={props.handleStyle}
                    railStyle={props.railStyle} />
                <div className="slider__button slider__button--plus" onClick={handleIncrement} style={props.plusStyle}>
                    <FontAwesomeIcon icon={faPlus} />
                </div>
            </div>
        </div>
    )
}*/

Metronome.propTypes = {
    playPauseStyle: PropTypes.object,
    bpmStyle: PropTypes.object,
    bpmTagStyle: PropTypes.object,
    plusStyle: PropTypes.object,
    minusStyle: PropTypes.object,
    handleStyle: PropTypes.object,
    trackStyle: PropTypes.object,
    railStyle: PropTypes.object,
    sliderStyle: PropTypes.object,
    minBpm: PropTypes.number,
    maxBpm: PropTypes.number,
    startBpm: PropTypes.number,
    volume: PropTypes.number,
    frequency: PropTypes.number
}

export default Metronome