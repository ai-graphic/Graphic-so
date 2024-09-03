"use client"
import type { AI, UIState } from '../../../../../../../lib/actions'
import { Thread, type AppendMessage } from '@assistant-ui/react'
import {
  useVercelRSCRuntime,
  VercelRSCMessage
} from '@assistant-ui/react-ai-sdk'
import { useActions, useUIState } from 'ai/rsc'
import { nanoid } from '@/lib/utils'
import { useUser } from '@clerk/nextjs'
import { usePathname } from 'next/navigation'

const convertMessage = (message: UIState[number]): VercelRSCMessage => {
  return {
    id: nanoid(),
    role: message.role,
    display: (
      <div>
        {message.spinner}
        {message.display}
        {message.attachments}
      </div>
    )
  }
}

const Chat = () => {
  const { submitUserMessage } = useActions();
  const [messages, setMessages] = useUIState<typeof AI>();
  const { user } = useUser();
  const pathname = usePathname();
  const workflowId = pathname.split("/")[3];

  const onNew = async (m: AppendMessage) => {
    if (m.content[0].type !== 'text')
      throw new Error('Only text messages are supported');
    const input = m.content[0].text;


    setMessages((currentConversation: UIState) => [
      ...currentConversation,
      { id: nanoid(), role: 'user', display: input }
    ]);

    // Submit and get response message
    const message = await submitUserMessage(input, user?.id, workflowId);
    setMessages((currentConversation: UIState) => [
      ...currentConversation,
      message
    ]);
  };

  const runtime = useVercelRSCRuntime({ messages, convertMessage, onNew });

  return (
    <div className='flex justify-center h-[100vh] overflow-hidden items-center '>

      <Thread
        runtime={runtime}
        welcome={{
          suggestions: [
            {
              text: 'image of a dilapidated house with boarded-up windows, overgrown with weeds, and a sign that reads "Beware: Mad Man Inside."',
              prompt: '/image of a dilapidated house with boarded-up windows, overgrown with weeds, and a sign that reads "Beware: Mad Man Inside".'
            },
            {
              text: 'Imagine a serene village nestled in the remote, rocky terrain of Mars. Picture quaint, dome-shaped dwellings surrounded by red dust and craggy mountains in the distance.',
              prompt: '/Imagine a serene village nestled in the remote, rocky terrain of Mars. Picture quaint, dome-shaped dwellings surrounded by red dust and craggy mountains in the distance..'
            }
          ]
        }}
      />
    </div>
  );
}

export default Chat; 