import { it, describe, expect } from 'vitest'
import React from '../core/react'


describe('createElement', () => {
    it('should create a new element', () => {
        const el = React.createElement('div', null, "hello");
        expect(el).toEqual(
            {
            type: 'div',
            props:{
                children:[{
                    type: 'TEXT_ELEMENT',
                    props: {
                        nodeValue: 'hello',
                        children: []
                    }
                }]
            }
        }
        )
    })
})