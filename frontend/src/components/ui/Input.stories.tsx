import type { Meta, StoryObj } from "@storybook/react"
import { Input } from "./Input"

const meta = {
  title: "UI/Input",
  component: Input,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div style={{ width: "320px" }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    disabled: { control: "boolean" },
  },
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { placeholder: "Enter text here..." },
}

export const WithLabel: Story = {
  args: { label: "Username", placeholder: "johndoe" },
}

export const WithHelperText: Story = {
  args: {
    label: "Email",
    type: "email",
    placeholder: "you@example.com",
    helperText: "We'll never share your email.",
  },
}

export const WithError: Story = {
  args: {
    label: "Password",
    type: "password",
    defaultValue: "bad",
    error: "Password must be at least 8 characters.",
  },
}

export const Disabled: Story = {
  args: {
    label: "Disabled Input",
    placeholder: "Cannot type here",
    disabled: true,
  },
}
