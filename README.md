# graphic.so - No-code automation

## Overview 🔭

**graphic.so** is a no-code automation platform that enables users to effortlessly build multi-media workflows by combining AI nodes like OpenAI, Claude, and Flux, lumalabs, stabel-diffusion, etc.

### key-features ⚡

- **No-Code Tool**: Easily create complex automations without writing a single line of code.
- **AI Integration**: Seamlessly integrate with many AI models to enhance functionality.
- **Customizable Workflows**: Tailor workflows to meet the specific needs of your processes.
- **User-Friendly Interface**: A clean, intuitive interface that makes automation accessible to everyone.


## Table of Contents

- [Demo Pictures](#demo-pics)
- [Key Features](#key-features-)
- [How It Works](#how-it-works-)
- [Setting Up Your First Workflow](#setting-up-your-first-workflow-)
- [Current Integrations & Planned](#current-integrations--planned-)
- [Technologies Used](#technologies-used)
- [How to Run](#how-to-run)
- [Contributing](#contributing)
- [Development Status](#development-status-)
- [License](#license)

## demo-pics

![Demo Image 2](https://res.cloudinary.com/dqougmpti/image/upload/v1727086072/g03lcy6oxbzpjnwv42zm.png)

![Demo Image 3](https://res.cloudinary.com/dqougmpti/image/upload/v1727086071/vuoand1oiw2yxfcc8vmr.png)

![Demo Image 4](https://res.cloudinary.com/dqougmpti/image/upload/v1727086071/ewvjl0dty0dga1sreh6j.png)



### How It Works ✅

graphic.so leverages a chat interface and input triggers to initiate workflows that integrate seamlessly with other applications like Discord, Slack, and Notion.
When a specified input is received or a chat interaction occurs,
graphic.so activates the designated actions in the connected services to facilitate real-time responses and automate tasks efficiently. Additionally, it employs advanced AI models such as Flux, LumaLabs, and Stable Diffusion to generate generative images and videos, automating creative processes across various media applications.

### Setting Up Your First Workflow ⭕

1. **Define the Trigger**:
   Configure Google Drive as the trigger. Specify the events within Google Drive that should start the workflow.

2. **Configure the Actions**:
   Choose and set up the actions that should be executed in Discord, Slack, or Notion once the trigger event occurs.

3. **Test and Deploy**:
   Test the workflow thoroughly to ensure that it functions as intended. Once confirmed, deploy it to automate your tasks without further manual intervention.

## Current Integrations & Planned 🧑‍💻

<div align="center">

| Integration            | Type           | Status | Description                                                                    |
| ---------------------- | -------------- | ------ | ------------------------------------------------------------------------------ |
| AI                     | Action/Trigger | Active | Use the power of AI to summarize, respond, create and much more.               |
| Chat                   | Action         | Active | Sharable Chat interface to interact with the workflow.                         |
| Slack                  | Action         | Active | Send a notification to Slack.                                                  |
| Notion                 | Action         | Active | Create entries directly in Notion.                                             |
| Discord                | Action         | Active | Post messages to your Discord server.                                          |
| Flux Development       | Action         | Active | Development tools for creating and testing flux models.                        |
| Image-to-Image         | Action         | Active | Convert one image to another using AI models.                                  |
| Flux LoRA              | Action         | Active | Low-rank adaptation for fine-tuning flux models.                               |
| Train Flux             | Action         | Active | Train flux models with custom datasets.                                        |
| Stable Video           | Action         | Active | Generate stable videos using AI techniques.                                    |
| Auto Caption           | Action         | Active | Generate captions for videos using AI models.                                  |
| Sad Talker             | Action         | Active | Generate video with images and audio files using AI models.                    |
| Music Generation       | Action         | Active | Generate music using Meta Music-Gen models.                                    |
| CogVideoX-5B           | Action         | Active | Generate videos using open source CogVideoX-5B models.                         |
| Video-to-Video         | Action         | Active | Convert one video to another using AI models.                                  |
| Luma Labs ImageToVideo | Action         | Active | Convert images to videos using Luma Labs models.                               |
| Luma Labs TextToVideo  | Action         | Active | Convert text to videos using Luma Labs models.                                 |
| Consistent Character   | Action         | Active | Create images of a given character in different poses.                         |
| DreamShaper            | Action         | Active | Generate a new image from an input image with DreamShaper V6.                  |
| Flux General           | Action         | Active | Generate stable images with FLUX.1 [dev], next generation text-to-image model. |
| Flux Dev LoRA          | Action         | Active | FLUX.1-Dev Multi LoRA Explorer.                                                |
| Text-to-Voice          | Action         | Active | Text to video model by elevenlabs which can convert text to audio.             |
| Google Calendar        | Action         | Active | Create a calendar invite.                                                      |
| Custom Webhook         | Action         | Active | Connect any app that has an API key and send data to your application.         |
| Trigger                | Trigger        | Active | An event that starts the workflow.                                             |
| Email                  | Action         | Active | Send an email to a user.                                                       |
| Wait                   | Action         | Active | Delay the next action step by using the wait timer.                            |
| Condition              | Action         | Active | Boolean operator that creates different conditions lanes.                      |
| Google Drive           | Action         | Active | Connect with Google Drive to trigger actions or to create files and folders.   |

</div>

## Technologies Used

This project utilizes a range of technologies including Next.js, React, Tailwind CSS, and various AI and automation libraries such as:

- **AI & Automation Libraries**

  - `@agentic/ai-sdk`
  - `@agentic/bing`
  - `@agentic/firecrawl`
  - `@ai-sdk/anthropic`
  - `@ai-sdk/openai`
  - `@assistant-ui/react`
  - `@assistant-ui/react-ai-sdk`
  - `@browserbasehq/sdk`
  - `@fal-ai/serverless-client`
  - `@notionhq/client`
  - `lumaai`
  - `replicate`
  - `elevenlabs`

- **UI & Components**

  - `@radix-ui` (Multiple components like React-Accordion, React-Dialog, etc.)
  - `@xyflow/react`
  - `@uploadcare/react-uploader`

- **Miscellaneous**

  - `axios`
  - `clsx`
  - `googleapis`
  - `react-hook-form`
  - `zustand`

- **Styling**

  - `tailwindcss-animate` (Animation extension for Tailwind CSS)

- **Utilities**
  - `nanoid`
  - `uuid`

This extensive tech stack ensures a robust, responsive, and scalable application, enhancing user engagement through efficient use of modern web technologies and integrations.

## How to Run

To set up and run graphic.so locally, follow these detailed steps:

1. **Install Dependencies**:

   - Run `npm install` to install all necessary dependencies from the `package.json` file.

2. **Environment Setup**:

   - Copy the example environment file to create your own: `cp .env.example .env`.
   - Modify the `.env` file with your specific configurations (API keys, database URL, etc.).

3. **Database Setup**:

   - Initialize your database schema: `npx prisma generate`.
   - Push the schema to your database: `npx prisma db push`.

4. **Setup ngrok**:

   - Run ngrok to expose your local development server: `ngrok http https://localhost:3000`.
   - Copy the HTTPS URL provided by ngrok. This URL will be used as the webhook URL in Clerk.
   - Configure the webhook URL in your Clerk settings to the ngrok HTTPS URL while turning `user.created` and `user.updated` options on.

5. **Start the Development Server**:
   - Launch the development server with `npm run dev`.
   - Open your web browser and visit `https://localhost:3000` to see the application in action.

For any issues or detailed customization of your setup, please [open an issue](https://github.com/ai-graphic/graphic.so/issues) on our GitHub repository, and we will provide assistance tailored to your environment.

## Contributing

We're thrilled that you're interested in contributing to our project! This is a collaborative effort between our company and the open-source community, and we welcome contributions of all kinds. Here's how you can get involved:

### Ways to Contribute

1. **Star the Project**: If you find this project useful, give it a star! It helps increase visibility and shows your support.

2. **Fork the Repository**: Create your own fork of the project to work on improvements or new features.

3. **Submit Pull Requests**: Have a bug fix or a new feature? We'd love to review your pull requests!

4. **Report Issues**: Found a bug or have a suggestion? Open an issue to let us know.

5. **Improve Documentation**: Help us make our docs better by fixing typos, clarifying explanations, or adding examples.

6. **Spread the Word**: Share this project with others who might find it useful.

### Contribution Guidelines

1. **Code of Conduct**: Please read and adhere to our [Code of Conduct](code-of-conduct.md) in all your interactions.

2. **Coding Standards**: Follow the coding style and standards used throughout the project. If in doubt, mimic the style of the existing codebase.

3. **Testing**: Ensure that your code changes are covered by appropriate tests.

4. **Documentation**: Update relevant documentation to reflect your changes.

5. **Commit Messages**: Write clear, concise commit messages describing the changes you've made.

6. **Pull Request Process**:

   - Create a new branch for your feature or bug fix
   - Make your changes and commit them with clear messages
   - Push your branch and submit a pull request
   - Respond to any feedback on your pull request

7. **License**: By contributing, you agree that your contributions will be licensed under the project's existing license.

### Getting Started

If you're new to contributing to open source, check out [GitHub's guide on how to contribute to open source](https://opensource.guide/how-to-contribute/).

For more detailed information on how to contribute to this specific project, please see our [CONTRIBUTING.md](contributing.md) file.

## Development Status 🧑‍💻

Please note that graphic.so is currently in the development phase and has not been commercialized. The repository and its contents are intended for developmental use and are not yet available for public release. This stage allows us to refine functionalities and ensure robust integration across various platforms before a broader deployment. Stakeholders and potential contributors should be aware that the project's features and codebase are subject to change as we enhance and expand its capabilities.

# License

This project is licensed under the GNU Affero General Public License v3.0 (AGPL-3.0).

## Summary

- You are free to use, modify, and distribute this software.
- If you modify the software, you must disclose the source code of your modifications.
- If you run a modified version of this software as a network service, you must make the complete source code of the modified version available to users of that service.
- The software is provided "as is", without any warranty.

## License Text

```
GNU AFFERO GENERAL PUBLIC LICENSE
Version 3, 19 November 2007

Copyright (C) 2024 Graphic.so

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
```

## Important Note

If you modify this software and make it available as a network service, you are required to provide the complete corresponding source code to the users of that service. This is a key provision of the AGPL-3.0 license.

## Full License

For the complete terms and conditions of the license, please refer to the [full text of the GNU Affero General Public License v3.0](https://www.gnu.org/licenses/agpl-3.0.html).
