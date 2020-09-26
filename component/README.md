# Metronome

![React Metronome](https://repository-images.githubusercontent.com/221067826/f8221a80-f6cb-11ea-8c0b-2d1a402e1f2a "React Metronome")

A ReactJS Metronome component inspired by Google's implementation

Uses the Web Audio API and Web Worker API to create a metronome that doesn't drift and
doesn't suffer from the non-guaranteed nature of Javascript's setInterval function.

## Prerequisites

* [React ^16.9.0](https://reactjs.org/) - Javascript library for user interfaces

## Installing

```
npm install @kevinorriss/react-metronome
```

## Usage

Import the component

```
import Metronome from '@kevinorriss/react-metronome'
...

<!-- JSX -->
<div className="your-container">
    <Metronome />
</div>
```

### Props

All of the Metronome props are optional, providing the ability to make style and functional changes

| Name           | Datatype | Default   | Description                         |
| -------------- |:--------:| :-------: | :---------------------------------- |
| playPauseStyle | Object   | ```{}```  | The style to apply to the PLAY / PAUSE button |
| bpmStyle       | Object   | ```{}```  | The style to apply to the BPM number |
| bpmTagStyle    | Object   | ```{}```  | The style to apply to the 'BPM' text after the number |
| plusStyle      | Object   | ```{}```  | The style to apply to the PLUS BPM [+] button |
| minusStyle     | Object   | ```{}```  | The style to apply to the MINUS BPM [-] button |
| handleStyle    | Object   | ```{}```  | The style to apply to the slider handle |
| trackStyle     | Object   | ```{}```  | The style to apply to the slider track |
| railStyle      | Object   | ```{}```  | The style to apply to the slider rail |
| sliderStyle    | Object   | ```{}```  | The style to apply to the DIV containing the slider and +/- buttons |
| minBpm         | Number   | ```40```  | The minimum BPM that can be set via the slider and buttons |
| maxBpm         | Number   | ```200``` | The maximum BPM that can be set via the slider and buttons |
| startBpm       | Number   | ```100``` | The default BPM |
| volume         | Number   | ```0.1``` | The volume of the metronome (between 0 and 1) |
| frequency      | Number   | ```440``` | The frequency (in hertz) of the beep |

## Development

This repo comes with a react app for development purposes. To get started, open a terminal in the root of the project and then:

### Link the component to the app
```
cd ./component
npm link

cd ..
npm link @kevinorriss/react-metronome
```

### Start the app
```
npm start
```

### Start the rollup watcher
```
cd ./component
npm run dev
```

Whenever you make a change to the component code, the react app will update.

## Tests
```
npm test
```

TODO run the tests
TODO check github dependabot issues

This project uses Jest and Enzyme for its unit tests, simply run the above code to run the test suites.

If you want the tests to run during development, you will need to have rollup watching too!

## Author

* **Kevin Orriss** - [orriss.io](http://orriss.io)

## License

This project is licensed under the ISC License