import React, { useState } from 'react'
import { Button, Tooltip } from '@nextui-org/react'
import { MdChevronLeft } from 'react-icons/md'

import './MainTop.scss'

type MainTopProps = {
  setSidebarActive: Function
  sidebarActive: boolean
}

const MainTop = ({ setSidebarActive, sidebarActive }: MainTopProps) => {
  const onSidebarControlButtonClicked = (): void => setSidebarActive(!sidebarActive)

  return (
    <section className='main-top flex'>
      <section className='left-controls flex' aria-label='left-controls'>
        <Tooltip content={sidebarActive ? 'Close Sidebar' : 'Open Sidebar'}>
          <Button auto color="primary" size='sm' onClick={onSidebarControlButtonClicked} className={`sidebar-control-button ${sidebarActive ? '' : 'flip'}`} icon={<MdChevronLeft />} />
        </Tooltip>
      </section>
    </section>
  )
}

export default MainTop

