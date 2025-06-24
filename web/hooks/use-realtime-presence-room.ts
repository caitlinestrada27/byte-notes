'use client'

import { useCurrentUserImage } from '@/hooks/use-current-user-image'
import { useCurrentUserName } from '@/hooks/use-current-user-name'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

const supabase = createClient()

export type RealtimeUser = {
  id: string
  name: string
  image: string
}

export const useRealtimePresenceRoom = (roomName: string) => {
  const currentUserImage = useCurrentUserImage()
  const currentUserName = useCurrentUserName()

  const [users, setUsers] = useState<Record<string, RealtimeUser>>({})
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setCurrentUserId(session?.user?.id ?? null);
    };

    fetchSession();
  }, []);

  useEffect(() => {
    const room = supabase.channel(roomName)

    room
      .on('presence', { event: 'sync' }, () => {
        const newState = room.presenceState<{ id: string; image: string; name: string }>()

        const newUsers = Object.fromEntries(
          Object.entries(newState)
            .filter(([, values]) => values[0].id !== currentUserId) // This will filter out the viewer themself
            .map(([key, values]) => [
              key,
              { name: values[0].name, image: values[0].image },
            ])
        ) as Record<string, RealtimeUser>;
        setUsers(newUsers)
      })
      .subscribe(async (status) => {
        if (status !== 'SUBSCRIBED') {
          return
        }

        await room.track({
          id: currentUserId,
          name: currentUserName,
          image: currentUserImage,
        })
      })

    return () => {
      room.unsubscribe()
    }
  }, [roomName, currentUserName, currentUserImage])

  return { users }
}
