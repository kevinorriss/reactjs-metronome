import React from 'react'
import renderer from 'react-test-renderer'
import { mount } from 'enzyme'
import Metronome from '@kevinorriss/metronome'

let wrapper
beforeEach(() => {
    wrapper = mount(<Metronome />)
})

const sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}

const getBPM = () => {
    return wrapper.find('.metronome__bpm h1').text()
}

const clickPlus = () => {
    wrapper.find('.slider__button--plus').simulate('click')
}

const clickMinus = () => {
    wrapper.find('.slider__button--minus').simulate('click')
}

const clickPlayPause = () => {
    wrapper.find('.metronome__play-pause').simulate('click')
}

it('should render Metronome correctly', () => {
    expect(renderer.create(<Metronome />).toJSON()).toMatchSnapshot()
})

it ('should increase BPM on + button click', () => {
    expect(getBPM()).toEqual('100')
    clickPlus()
    expect(getBPM()).toEqual('101')
})

it('should decrease BPM on - button click', () => {
    expect(getBPM()).toEqual('100')
    clickMinus()
    expect(getBPM()).toEqual('99')
})

it('should set state to active on clicking play', async () => {
    const play = jest.spyOn(window.HTMLMediaElement.prototype, 'play').mockImplementation(() => { })
    expect(wrapper.state('active')).toEqual(false)
    clickPlayPause()    
    expect(wrapper.state('active')).toEqual(true)
    await sleep(1500)
    expect(play).toHaveBeenCalled()
    play.mockRestore()
})

it('should set state to inactive on clicking pause', async () => {
    const play = jest.spyOn(window.HTMLMediaElement.prototype, 'play').mockImplementation(() => { })
    expect(wrapper.state('active')).toEqual(false)
    clickPlayPause()
    await sleep(1000)
    clickPlayPause()
    expect(wrapper.state('active')).toEqual(false)
    play.mockRestore()
})

it('should clamp bpm to min value', () => {
    wrapper.setState((prevState) => ({
        ...prevState,
        bpm: 41
    }))
    clickMinus()
    expect(getBPM()).toEqual('40')
    clickMinus()
    expect(getBPM()).toEqual('40')
})

it('should clamp bpm to max value', () => {
    wrapper.setState((prevState) => ({
        ...prevState,
        bpm: 217
    }))
    clickPlus()
    expect(getBPM()).toEqual('218')
    clickPlus()
    expect(getBPM()).toEqual('218')
})