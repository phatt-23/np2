// Created by phat-23 on 19/10/2025

import { DEMOS as cnf3DEMOS } from './cnf3';

export const DEMOS = {
'Yes(1)':
`a !a b
b a !b
`,

'Yes(2)': 
`x y z
!x y z
x !y z
`,

'Yes(3)':
`
a b c 
!a b c 
a !b !c
!a !b c
`,

'No(1)':
`x x x
!x !x !x
`,

'No(2)':
`a a a
!a !a b
!b !b !b
`,

'No(3)': 
`x y z
!x y z
x !y z
!x !y z
x y !z
!x y !z
x !y !z
!x !y !z
`,

'Yes(TeX)': 
`\\alpha \\beta \\gamma
!\\alpha \\beta \\gamma
\\alpha !\\beta \\gamma
`,

'No(TeX)':
`\\alpha_{1} \\alpha_{1} \\alpha_{1}
!\\alpha_{1} !\\alpha_{1} \\alpha_{2}
!\\alpha_{2} !\\alpha_{2} !\\alpha_{2}
`,

}
