import React from 'react'
import Slider from 'rc-slider'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlay, faPause, faPlus, faMinus } from '@fortawesome/free-solid-svg-icons'
import 'rc-slider/assets/index.css'
import './styles.css'
import click from './click.mp3'

class Metronome extends React.Component {
    constructor(props) {
        super(props)

        // bind the functions
        this.setBpm = this.setBpm.bind(this)
        this.handleDecrement = this.handleDecrement.bind(this)
        this.handleIncrement = this.handleIncrement.bind(this)
        this.handlePlayPause = this.handlePlayPause.bind(this)
        this.playClick = this.playClick.bind(this)
        this.removeBeatClass = this.removeBeatClass.bind(this)

        // set the initial state
        this.state = {
            min: 40,        // the minimum BPM allowed
            bpm: 100,       // the default BPM
            max: 218,       // the maximum BPM allowed
            active: false,  // true when the metronome is on
            interval: 600,  // the milliseconds between each click (600 = 100 BPM)
            beating: false  // true when play/pause button beat CSS is transitioning
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
        if (bpm < this.state.min || bpm > this.state.max) {
            return
        }

        // set the BPM and calculate the milliseconds interval between clicks
        // 60,000 ms = 1 minute so 60,000 / BPM is the time between beats
        this.setState((prevState) => ({
            ...prevState,
            bpm,
            interval: 60000.0 / bpm
        }))
    }

    /**
    * Called when the "minus" button is clicked
    * Decrements the BPM value by 1
    */
    handleDecrement() {
        this.setBpm(this.state.bpm - 1)
    }

    /**
    * Called when the "plus" button is clicked
    * Increments the BPM value by 1
    */
    handleIncrement() {
        this.setBpm(this.state.bpm + 1)
    }

    /**
     * Called when the "play" / "pause" button is clicked
     * Toggles between play and pause
     */
    handlePlayPause() {
        // set active to its NOT value
        this.setState((prevState) => ({
            ...prevState,
            active: !prevState.active
        }), () => {
            // if "play" button clicked then start the beating
            if (this.state.active) {
                setTimeout(this.playClick, this.state.interval, new Audio(click))
            }
        })
    }

    /**
     * Recursive function that calls itself in a timeout at the interval
     * calculated by the current BPM
     * 
     * @param {Audio} audio The sound to play on the beat
     */
    playClick(audio) {
        // play the beat sound
        audio.play()

        // if the metronome is playing, schedule the next beat
        // instantiate the audio object now, this prevents an initial stutter
        if (this.state.active) {
            setTimeout(this.playClick, this.state.interval, new Audio(click))
        }

        // set the state to beating to start the CSS transition on the play/pause button
        this.setState((prevState) => ({
            ...prevState,
            beating: true
        }))
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
                        <FontAwesomeIcon icon={this.state.active ? faPause : faPlay} />
                    </div>
                </div>
                <div className="metronome__slider">
                    <div className="slider__button slider__button--minus" onClick={this.handleDecrement}>
                        <FontAwesomeIcon icon={faMinus} />
                    </div>
                    <Slider min={this.state.min} max={this.state.max} step={1} value={this.state.bpm} onChange={this.setBpm} />
                    <div className="slider__button slider__button--plus" onClick={this.handleIncrement}>
                        <FontAwesomeIcon icon={faPlus} />
                    </div>
                </div>
            </div>
        )
    }
}

export default Metronome