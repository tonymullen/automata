# Automata

## TODO:
- User tutorial: basic walkthrough of how to create an automata and use the construction and testing features
- Add sticky notes for comments possibly via [fabric.js](http://fabricjs.com/fabric-intro-part-1) (they're just nodes with text now)
- Submachine support

## Description
An educational environment for creating and executing finite-state automata, pushdown automata, and Turing machines. Based on the [MEAN.js](http://www.meanjs.org) boilerplate and the [Cytoscape.js](http://js.cytoscape.org/) graph library.

A live WIP is on [Heroku](https://tmfsa.herokuapp.com/). Click on "Automata" to see a list of demo automata. To play around with creating your own, select "New Finite State Automaton",  "New Pushdown Automaton", or "New Turing Machine" from the "Create" dropdown menu. Hold your mouse button or touch to bring up the context menu to add states. Drag (or touch then drag) from one state's edgehandle to another to add transitions. Touch or click and hold until the state or edge turns red to delete, and click on a state (or double tap) to make a state an acceptance state (for FSAs).
