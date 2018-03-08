# Automata

An educational environment for creating and executing finite-state automata, pushdown automata, and Turing machines. Based on the [MEAN.js](http://www.meanjs.org) boilerplate and the [Cytoscape.js](http://js.cytoscape.org/) graph library.

A live WIP is on [Heroku](https://tmfsa.herokuapp.com/). Click on "Automata" to see a list of demo automata. To play around with creating your own, select "New Finite State Automaton",  "New Pushdown Automaton", or "New Turing Machine" from the "Create" dropdown menu. Hold your mouse button or touch to bring up the context menu to add states. Drag (or touch then drag) from one state's edgehandle to another to add transitions. Touch or click and hold until the state or edge turns red to delete, and click on a state (or double tap) to make a state an acceptance state (for FSAs).

### FSA demo

Accepts sequences with an even number of As and an odd number of Bs, rejects all other sequences.

![fsa](/readme_images/fsa.png)

### Pushdown automaton demo

Accepts sequences of N As followed by N Bs using a pushdown stack.

![pda](/readme_images/pda.png)

### Turing Machine demo

Takes as input a sequence of N As and M Bs separated by a single empty space. Stops with the read head one space to the left of a sequence of N + M Cs. 

![tm](/readme_images/tm.png)
