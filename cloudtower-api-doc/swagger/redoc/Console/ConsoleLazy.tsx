import React, { useEffect, useState } from 'react';
import { ConsoleProps } from '@redocly/reference-docs/lib/components/console/Console';
import { useDimensions } from '@redocly/reference-docs/lib/utils';
import { ConsoleWrap } from '@redocly/reference-docs/lib/components/console/styled.components';
import { CodeHeader } from '@redocly/reference-docs/lib/components/Panel';
import { Console as ConsoleComponent } from './Console';

export const Console = (props: ConsoleProps ) => {
  const [ mounted, setMounted ] = useState<{Console?:typeof ConsoleComponent}>({})
  const dime = useDimensions(props.rootElement)[0]
  useEffect(() => {
    import('./Console').then(({
      Console
    }) => {
      setMounted({ Console })
    })
  }, [])
  return (
    mounted.Console ? <mounted.Console {...props} /> : 
    <ConsoleWrap className={props.className} fullWidth={dime?.width}>
      <CodeHeader>...Loading</CodeHeader>
    </ConsoleWrap>
  )
}