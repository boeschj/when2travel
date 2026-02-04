import { format } from 'date-fns'
import { getRespondentColor } from './user-avatar'
import { buildAbsoluteUrl } from '@/lib/routes'

import type { PlanResponse } from '@/lib/types'
import type { Respondent } from './results-context'

const DATE_FORMAT = 'yyyy-MM-dd' as const

export interface DeleteConfig {
  onConfirm: () => void
  isPending: boolean
  responsesCount: number
}

export interface PopoverParticipant {
  id: string
  name: string
  isAvailable: boolean
  isCurrentUser: boolean
}

export function getSelectedRespondentColor(respondentId: string | null): string | null {
  if (!respondentId) return null
  return getRespondentColor(respondentId).hex
}

export function mapResponsesToRespondents(
  responses: PlanResponse[] | null,
  hasResponseToken: (id: string) => boolean
): Respondent[] {
  if (!responses) return []

  return responses.map((response) => ({
    id: response.id,
    name: response.name,
    availableDates: response.availableDates,
    isCurrentUser: hasResponseToken(response.id)
  }))
}

export function buildDeleteConfig({
  isCreator,
  onConfirm,
  isPending,
  responsesCount,
}: {
  isCreator: boolean
  onConfirm: () => void
  isPending: boolean
  responsesCount: number
}): DeleteConfig | undefined {
  if (!isCreator) return undefined
  return { onConfirm, isPending, responsesCount }
}

export function getPopoverParticipants({
  popoverDate,
  responses,
  hasResponseToken,
}: {
  popoverDate: Date | null
  responses: PlanResponse[]
  hasResponseToken: (id: string) => boolean
}): PopoverParticipant[] {
  if (!popoverDate) return []

  return mapResponsesToParticipants({
    responses,
    targetDate: popoverDate,
    hasResponseToken,
  })
}

export function buildShareUrl(planId: string): string {
  return buildAbsoluteUrl('/plan/$planId/respond', { planId })
}

function mapResponsesToParticipants({
  responses,
  targetDate,
  hasResponseToken,
}: {
  responses: PlanResponse[]
  targetDate: Date
  hasResponseToken: (id: string) => boolean
}): PopoverParticipant[] {
  const formattedTargetDate = format(targetDate, DATE_FORMAT)

  return responses.map((response) => ({
    id: response.id,
    name: response.name,
    isAvailable: response.availableDates.includes(formattedTargetDate),
    isCurrentUser: hasResponseToken(response.id)
  }))
}
