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
`a b c 
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

'Yes-TeX(1)': 
`\\alpha \\beta \\gamma
!\\alpha \\beta \\gamma
\\alpha !\\beta \\gamma
`,

'Yes-TeX(2)':
`\\alpha !\\alpha \\beta
\\beta \\alpha !\\beta
`,

'No-TeX(1)':
`\\chi \\chi \\chi
!\\chi !\\chi !\\chi
`,

'No-TeX(2)':
`\\alpha_{1} \\alpha_{1} \\alpha_{1}
!\\alpha_{1} !\\alpha_{1} \\alpha_{2}
!\\alpha_{2} !\\alpha_{2} !\\alpha_{2}
`,
}

