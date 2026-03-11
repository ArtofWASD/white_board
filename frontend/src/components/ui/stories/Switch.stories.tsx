import type { Meta, StoryObj } from "@storybook/react"
import { Switch } from "../Switch"
import { useState } from "react"

const meta = {
  title: "UI/Switch",
  component: Switch,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    checked: { control: "boolean" },
    disabled: { control: "boolean" },
  },
} satisfies Meta<typeof Switch>

export default meta
type Story = StoryObj<typeof meta>

const SwitchWithState = (args: React.ComponentProps<typeof Switch>) => {
  const [checked, setChecked] = useState(args.checked ?? false)
  return <Switch {...args} checked={checked} onChange={setChecked} />
}

export const Interactive: Story = {
  args: { checked: false, onChange: () => {} },
  render: (args) => <SwitchWithState {...args} />,
}

export const Checked: Story = {
  args: { checked: true, onChange: () => {} },
}

export const Unchecked: Story = {
  args: { checked: false, onChange: () => {} },
}

export const DisabledOn: Story = {
  args: { checked: true, disabled: true, onChange: () => {} },
}

export const DisabledOff: Story = {
  args: { checked: false, disabled: true, onChange: () => {} },
}
