# NOTES TO MYSELF

## OBSERVABLE CLASSES

When using classes, you must use $state on every member variable, otherwise it won't be proxied.
When using type, it is proxied automatically.
Classes are fucked like this. 
Also the file must have .svelte.ts extension.

## TODO

- [ ] - decide on the final UI layout
- [ ] - style the components
- [x] - if inInstance is empty, could be different for each problem (add a pure virtual function)
do not allow reducing nor solving (UI constraint and logic constraint)
- [x] - 3SAT to 3CG reduction
- [x] - style the 3CG (from 3SAT to 3CG) so it's more readable
- [x] - change the hcycle-hcircuit node naming to be prefixes not postfixes (n:x_in, n:x_gap, n:x_out -> nin:x, ngap:x, nout:x)
- [ ] - rename asString() to format() as it is formatting the problem instance to a format that the editor accepts, now it's confusing because problem instances have toSerializedString()
- [ ] - add editor checks for illegal symbols like %#@!-_() and so on
- [ ] - 3sat to hcycle uses a different edge id naming scheme to the rest, change it (now it's using only the node names in its edge ids, it should use the entire id, including the prefix)

## 3SAT to 3CG

I chose this reduction over 3SAT to 3DM, because it is simpler to visualize since visualization is the main point of this project. 3DM instances are quite difficult to layout in a way that is not a total eye sore.

### 3CG - 3-Color Graph
- Input: Bidirectional graph G = (V,E).
- Output: Can the vertices v in V be colored by 3 colors, such that for each x,y in V, color(x) = color(y) iff {x,y} is not in E.

### 3SAT to 3CG example

Assuming the three colors in use are Red, Blue and Green.

Suppose we have a formula 

phi = (x1 or not x2 or x3) and (not x1 or x2 or x3).

To construct a graph G = (V,E) in such a way that it is a 3CG, we follow these steps:
1. Add three vertices T, F, and B into V
    - T stands for true vertex - Green
    - F stands for false vertex - Red
    - B stands for buffer vertex - Blue
2. For each variable x in formula phi, add x and not x into V and add edges (x,not x), (x,B) and (not x,B). This is the variable gadget.
    - we connect x and not x to B, because we don't want to allow them to be Blue. They must be either Green, or Red.
    - we connect x and not x together, because both of them cannot be true (Green) or false (Red). It's either Red, or Green.
    - they represent the assignment. if variable x is Green, that means it is true in the clause. so in the clause (x or not y or z), if x is Green then x = true, if y is Green then y = false.
3. For each clause, we add a clause gadget. The vertices belonging to a gadget are all 3 variables in a clause (x1,x2,x3) + 6 additional vertices y1, y2, y3, z1, z2, z3. 
   The edges between them are:
    - x1, x2, x3 are connected to the B (Blue) vertex, they represent the assignment (truth values)
    - {x1,y1}, {x2,y2}, {x3,y3}
    - {y1,z1}, {y2,z2}, {y3,z3}
    - y1, y2, y3 are connected to T (Green) vertex
    - {T(Green),z1}, {z1,z2}, {z2,z3}, {z3,F(Red)}

    This gadget cannot be colored by 3 colors iff x1,x2,x3 are all Red. If just one of them is Green then it is possible.

This means that the formula phi has a satisfying assignment iff the all the clause gadgets are 3CG. All clause gadgets will be 3CGs iff in all of them there's at least one x variable (clause literal) that is Green (true). In addition the variable clauses have to also be 3CGs.

If we find a 3CG for the entire graph, we can construct the assignment simply by looking at which variables are Green and which are Red. If x is Green then x = True and If not x is Green then x = False in the final assignment.
    
Suppose we have a graph G = (V,E) where:

```
V = {T,F,B} union {v, notv | for each variable v} union {c1,c2,c3,c4,c5,c6 for each clause c}
E = {
    {T,F},
    {F,B},
    {B,T},
} 
union { {v,notv}, {v,B}, {notv,B} | for each variable v }
union { {c1,c4}, {c2,c5}, {c3,c6},   
        {x1,c1}, {x2,c2}, {x3,c3}, 
        {T,c1}, {T,c2}, {T,c3},  
        {T,c4}, {c4,c5}, {c5,c6}, {c6,F} | for each clause c }
```



