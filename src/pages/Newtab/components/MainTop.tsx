import React, { useContext, useState } from 'react'
import { Button, Tooltip } from '@nextui-org/react'
import { RiArrowLeftLine } from 'react-icons/ri'

import './MainTop.scss'
import { Context, ContextInterface } from '../Context'

const MainTop = () => {
  const { sidebarActive, setSidebarActive } = useContext(Context) as ContextInterface

  const onSidebarControlButtonClicked = (): void => setSidebarActive(!sidebarActive)


  return (
    <section className='main-top flex'>
      <section className='left-controls flex' aria-label='left-controls'>
        <Tooltip placement='bottomStart' content={sidebarActive ? 'Close Sidebar' : 'Open Sidebar'}>
          <Button color="primary" auto ghost size='sm' onClick={onSidebarControlButtonClicked} className={`sidebar-control-button flex ${sidebarActive ? '' : 'flip'}`} icon={<RiArrowLeftLine />} />
        </Tooltip>
      </section>
    </section>
  )
}

export default MainTop

