import type { ReactNode } from 'react'

export interface StatBox {
  id: string
  num: number | null
  cap: string
}

export interface ProjectBrief {
  id: string
  text: string
}

export interface IllustratedProject {
  id: string
  title: string
  desc: string
  tags: string[]
  icon?: ReactNode
  image?: string
}

export interface ClassifiedItem {
  id: string
  title: string
  date: string
  /** Link to the source Notion page, when this item was synced from Notion. */
  notionUrl?: string
  /** til/<folder> name holding this entry's markdown + images, when synced locally. */
  folder?: string
}
