import React from 'react'
import Slider from 'rc-slider'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlay, faPause, faPlus, faMinus } from '@fortawesome/free-solid-svg-icons'
import 'rc-slider/assets/index.css'
import './styles.css'
import click from './click.mp3'

const MIN_BPM = 40
const MAX_BPM = 200
const START_BPM = 100

class Metronome extends React.Component {
    constructor(props) {
        super(props)

        // bind the functions
        this.setBpm = this.setBpm.bind(this)
        this.handlePlayPause = this.handlePlayPause.bind(this)
        this.tick = this.tick.bind(this)
        this.removeBeatClass = this.removeBeatClass.bind(this)
        
        this.tracks = [new Audio(click), new Audio(click), new Audio(click)]
        this.trackIndex = 0
        this.unmounting = false
        this.milliseconds = 60000.0 / START_BPM
        this.nextBeat = null
        this.before = null
        this.now = null

        // set the initial state
        this.state = {
            bpm: START_BPM,                     // the default BPM
            playing: false,                     // true when metronome is active
            beating: false                      // true when play/pause button beat CSS is transitioning
        }
    }

    /**
    * Sets the beats per minute of the metronome in the state
    * Will ignore values outside of the min/max range
    *
    * @param {Number} bpm The beats per minute to set
    */
    setBpm(bpm) {
        // return early if the new value is outside of accepted range
        if (bpm < MIN_BPM || bpm > MAX_BPM) {
            return
        }

        // calculate the new milliseconds
        this.milliseconds = 60000.0 / bpm

        // set the BPM and calculate the milliseconds interval between clicks
        // 60,000 ms = 1 minute so 60,000 / BPM is the time between beats
        this.setState((prevState) => ({
            ...prevState,
            bpm
        }))
    }

    /**
     * Called when the "play" / "pause" button is clicked
     * Toggles between play and pause
     */
    handlePlayPause() {
        // active, pause
        if (this.state.playing) {
            this.setState((prevState) => ({
                ...prevState,
                playing: false
            }), () => {
                this.nextBeat = null
                this.before = null
                this.now = null
            })
        // not active, play
        } else {
            this.setState((prevState) => ({
                ...prevState,
                playing: true
            }), () => {
                setTimeout(this.tick, 0)
            })
        }
    }

    tick() {
        if (!this.state.playing || this.unmounting) return

        this.now = Date.now()
        if (this.nextBeat == null) {
            this.nextBeat = new Number(this.now)
        }
        
        if (this.now >= this.nextBeat) {
            this.tracks[this.trackIndex].play()
            if (this.trackIndex+1 >= this.tracks.length) {
                this.trackIndex = 0
            } else {
                this.trackIndex++
            }
            this.setState((prevState) => ({
                ...prevState,
                beating: true
            }))

            // calculate the next beat time
            this.nextBeat += this.milliseconds

            // detect a time anomaly
            if (this.now >= this.nextBeat || (this.before != null && this.now <= this.before)) {
                // stop playing, give an error and break out of the while loop
                this.setState((prevState) => ({
                    ...prevState,
                    playing: false,
                    error: 'Time travel detected!'
                }))
            }
        }

        // store the current now for the next iteration
        this.before = new Date(this.now)

        setTimeout(this.tick, 0)
    }

    /**
     * Called when the CSS border transition on the play/pause button is complete
     * Resets the beating state so that the CSS class is removed
     */
    removeBeatClass() {
        this.setState((prevState) => ({
            ...prevState,
            beating: false
        }))
    }
    
    /**
     * Called when the component is being removed from the dom, cleanup code goes here
     */
    componentWillUnmount() {
        // break the recursive setTimeout calls
        this.unmounting = true
    }

    render() {
        return (
            <div className="metronome">
                <div className="metronome__top">
                    <div className="metronome__bpm">
                        <h1>{this.state.bpm}</h1>
                        <small>BPM</small>
                    </div>
                    <div className={"metronome__play-pause" + (this.state.beating ? " metronome__play-pause--beat" : "")}
                        onClick={this.handlePlayPause} 
                        onTransitionEnd={this.removeBeatClass}
                    >
                        <FontAwesomeIcon icon={this.state.playing ? faPause : faPlay} />
                    </div>
                </div>
                <div className="metronome__slider">
                    <div className="slider__button slider__button--minus" onClick={() => { this.setBpm(this.state.bpm-1) } }>
                        <FontAwesomeIcon icon={faMinus} />
                    </div>
                    <Slider min={MIN_BPM} max={MAX_BPM} step={1} value={this.state.bpm} onChange={this.setBpm} />
                    <div className="slider__button slider__button--plus" onClick={() => { this.setBpm(this.state.bpm+1) }}>
                        <FontAwesomeIcon icon={faPlus} />
                    </div>
                </div>
            </div>
        )
    }
}

export default Metronome