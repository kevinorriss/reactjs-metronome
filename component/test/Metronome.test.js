import React from 'react'
import renderer from 'react-test-renderer'
import { mount } from 'enzyme'
import Metronome from '../src/Metronome'

// mock the Worker class
class Worker { postMessage() { } }
window.Worker = Worker
window.URL.createObjectURL = jest.fn()

// mock the audio initialisation
jest.spyOn(Metronome.prototype, 'initAudio').mockImplementation(() => {})
const postMessage = jest.spyOn(window.Worker.prototype, 'postMessage')

// mount the component before each test
let wrapper
beforeEach(() => {
    wrapper = mount(<Metronome />)
})

// clear all the mocks after each test
afterEach(() => {
    jest.clearAllMocks()
})

// helper functions for clicking the UI buttons
const getBPM = () => wrapper.find('.metronome__bpm h1').text()
const clickPlus = () => wrapper.find('.slider__button--plus').simulate('click')
const clickMinus = () => wrapper.find('.slider__button--minus').simulate('click')
const clickPlayPause = () => wrapper.find('.metronome__play-pause').simulate('click')

it('should render Metronome correctly', () => {
    expect(renderer.create(<Metronome />).toJSON()).toMatchSnapshot()
})

it('should send starting interval to the worker', () => {
    expect(postMessage).toHaveBeenCalledTimes(1)
    expect(postMessage).toHaveBeenCalledWith({ message: "interval", interval: 25.0 })
})

it ('should increase BPM on + button click', () => {
    expect(getBPM()).toEqual('100')
    clickPlus()
    expect(getBPM()).toEqual('101')

    expect(renderer.create(<Metronome />).toJSON()).toMatchSnapshot()
})

it('should decrease BPM on - button click', () => {
    expect(getBPM()).toEqual('100')
    clickMinus()
    expect(getBPM()).toEqual('99')

    expect(renderer.create(<Metronome />).toJSON()).toMatchSnapshot()
})

it('should play on clicking play', () => {
    expect(wrapper.state('playing')).toEqual(false)
    clickPlayPause()
    expect(wrapper.state('playing')).toEqual(true)
    expect(postMessage).toHaveBeenLastCalledWith({ message: "start" })

    expect(renderer.create(<Metronome />).toJSON()).toMatchSnapshot()
})

it('should pause on clicking pause', () => {
    clickPlayPause()
    expect(wrapper.state('playing')).toEqual(true)

    clickPlayPause()
    expect(wrapper.state('playing')).toEqual(false)
    expect(postMessage).toHaveBeenLastCalledWith({ message: "stop" })

    expect(renderer.create(<Metronome />).toJSON()).toMatchSnapshot()
})

it('should clamp bpm to min value', () => {
    wrapper.setState((prevState) => ({ ...prevState, bpm: 41 }))
    clickMinus()
    expect(getBPM()).toEqual('40')
    clickMinus()
    expect(getBPM()).toEqual('40')

    expect(renderer.create(<Metronome />).toJSON()).toMatchSnapshot()
})

it('should clamp bpm to max value', () => {
    wrapper.setState((prevState) => ({ ...prevState, bpm: 199 }))
    clickPlus()
    expect(getBPM()).toEqual('200')
    clickPlus()
    expect(getBPM()).toEqual('200')

    expect(renderer.create(<Metronome />).toJSON()).toMatchSnapshot()
})

it('should post close to worker on unmount', () => {
    wrapper.unmount()
    expect(postMessage).toHaveBeenLastCalledWith({ message: "close" })
})