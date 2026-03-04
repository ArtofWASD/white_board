import type { Meta, StoryObj } from "@storybook/react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../Card"
import { Button } from "../Button"

const meta = {
  title: "UI/Card",
  component: Card,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div style={{ width: "400px" }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    noPadding: { control: "boolean" },
  },
} satisfies Meta<typeof Card>

export default meta
type Story = StoryObj<typeof meta>

export const Simple: Story = {
  args: {
    children: (
      <>
        <h3 className="text-lg font-bold mb-2">Simple Card</h3>
        <p className="text-muted-foreground text-sm">Basic card with default padding.</p>
      </>
    ),
  },
}

export const Composed: Story = {
  render: () => (
    <Card>
      <CardHeader>
        <CardTitle>Composed Card</CardTitle>
        <CardDescription>All compound sub-components used together.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">Card content goes here.</p>
      </CardContent>
      <CardFooter className="justify-end gap-2">
        <Button variant="outline" size="sm">
          Cancel
        </Button>
        <Button size="sm">Save</Button>
      </CardFooter>
    </Card>
  ),
}

export const NoPadding: Story = {
  args: {
    noPadding: true,
    children: (
      <div>
        <div className="bg-primary/10 p-4 rounded-t-lg">
          <h3 className="font-bold">Full-bleed Header</h3>
        </div>
        <div className="p-4">
          <p className="text-sm text-muted-foreground">Content with manual padding.</p>
        </div>
      </div>
    ),
  },
}
