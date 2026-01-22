'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { addDays, format } from 'date-fns'
import { Calendar, Loader2, Plus } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'

interface TeamMember {
  id: string
  name: string | null
  email: string
}

interface CreateRoundDialogProps {
  assessmentId: string
  teamMembers: TeamMember[]
  trigger?: React.ReactNode
}

const createRoundSchema = z.object({
  title: z.string().max(255).optional(),
  deadline: z.string().min(1, 'Deadline is required'),
  quorum_percentage: z.number().min(1).max(100),
  participant_ids: z.array(z.string()).min(1, 'Select at least one participant'),
})

type CreateRoundFormValues = z.infer<typeof createRoundSchema>

export function CreateRoundDialog({
  assessmentId,
  teamMembers,
  trigger,
}: CreateRoundDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const defaultDeadline = addDays(new Date(), 3)

  const form = useForm<CreateRoundFormValues>({
    resolver: zodResolver(createRoundSchema),
    defaultValues: {
      title: '',
      deadline: format(defaultDeadline, "yyyy-MM-dd'T'HH:mm"),
      quorum_percentage: 50,
      participant_ids: [],
    },
  })

  const selectedParticipants = form.watch('participant_ids')

  async function onSubmit(data: CreateRoundFormValues) {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/ic-rounds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assessment_id: assessmentId,
          title: data.title || null,
          deadline: new Date(data.deadline).toISOString(),
          quorum_percentage: data.quorum_percentage,
          participant_ids: data.participant_ids,
        }),
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || 'Failed to create voting round')
      }

      toast.success('Voting round created')
      setOpen(false)
      form.reset()
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create voting round')
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectAllParticipants = () => {
    form.setValue('participant_ids', teamMembers.map((m) => m.id))
  }

  const clearParticipants = () => {
    form.setValue('participant_ids', [])
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New IC Vote
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create IC Voting Round</DialogTitle>
          <DialogDescription>
            Start a blind voting round for investment committee members.
            Votes remain hidden until revealed.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Series A Decision" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="deadline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Voting Deadline</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="datetime-local"
                        className="pl-9"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Votes will be auto-revealed after this time
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="quorum_percentage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quorum Percentage</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min={1}
                        max={100}
                        className="w-20"
                        value={field.value}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 50)}
                      />
                      <span className="text-muted-foreground">%</span>
                    </div>
                  </FormControl>
                  <FormDescription>
                    Minimum participation required
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="participant_ids"
              render={() => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Participants</FormLabel>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={selectAllParticipants}
                      >
                        Select All
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={clearParticipants}
                      >
                        Clear
                      </Button>
                    </div>
                  </div>
                  <div className="border rounded-lg p-3 space-y-2 max-h-48 overflow-y-auto">
                    {teamMembers.map((member) => (
                      <FormField
                        key={member.id}
                        control={form.control}
                        name="participant_ids"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(member.id)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    field.onChange([...field.value, member.id])
                                  } else {
                                    field.onChange(
                                      field.value?.filter((id) => id !== member.id)
                                    )
                                  }
                                }}
                              />
                            </FormControl>
                            <div className="leading-none">
                              <span className="font-medium">
                                {member.name || 'Unnamed'}
                              </span>
                              <span className="text-muted-foreground text-sm ml-2">
                                {member.email}
                              </span>
                            </div>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                  <FormDescription>
                    {selectedParticipants.length} participant{selectedParticipants.length !== 1 ? 's' : ''} selected
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Voting Round
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
