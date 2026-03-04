import type { Meta, StoryObj } from "@storybook/react"
import { Button } from "../Button"
import { Mail, ArrowRight } from "lucide-react"

const meta = {
  title: "UI/Button",
  component: Button,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "outline", "ghost", "link", "staticWhite"],
    },
    size: {
      control: "select",
      options: ["default", "sm", "md", "lg", "xl", "icon"],
    },
    disabled: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: "Button",
    variant: "default",
  },
}

export const Outline: Story = {
  args: {
    ...Default.args,
    variant: "outline",
    children: "Outline",
  },
}

export const Ghost: Story = {
  args: {
    ...Default.args,
    variant: "ghost",
    children: "Ghost",
  },
}

export const LinkBtn: Story = {
  args: {
    ...Default.args,
    variant: "link",
    children: "Link Button",
  },
}

export const Small: Story = {
  args: {
    ...Default.args,
    size: "sm",
    children: "Small Button",
  },
}

export const Medium: Story = {
  args: {
    ...Default.args,
    size: "md",
    children: "Medium Button",
  },
}

export const Large: Story = {
  args: {
    ...Default.args,
    size: "lg",
    children: "Large Button",
  },
}

export const ExtraLarge: Story = {
  args: {
    ...Default.args,
    size: "xl",
    children: "Extra Large Button",
  },
}

export const StaticWhiteOutline: Story = {
  args: {
    variant: "static",
    size: "xl",
    children: "Перейти в календарь тренировок",
  },
  parameters: {
    backgrounds: { default: "dark" },
  },
}

export const IconButton: Story = {
  args: {
    ...Default.args,
    size: "icon",
    children: <Mail className="h-4 w-4" />,
  },
}

export const WithIconLeft: Story = {
  args: {
    ...Default.args,
    children: (
      <>
        <Mail className="mr-2 h-4 w-4" /> Login with Email
      </>
    ),
  },
}

export const WithIconRight: Story = {
  args: {
    ...Default.args,
    children: (
      <>
        Next Step <ArrowRight className="ml-2 h-4 w-4" />
      </>
    ),
  },
}

export const Disabled: Story = {
  args: {
    ...Default.args,
    disabled: true,
    children: "Disabled",
  },
}
