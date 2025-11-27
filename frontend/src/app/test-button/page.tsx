import React from 'react';
import Button from '../../components/ui/Button';

export default function TestButtonPage() {
  return (
    <div className="p-10 space-y-10">
      <h1 className="text-3xl font-bold">Button Component Test</h1>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Sizes</h2>
        <div className="flex items-center gap-4">
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Variants</h2>
        <div className="flex items-center gap-4">
          <Button variant="primary">Primary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">With Tooltip</h2>
        <div className="flex items-center gap-4">
          <Button size="md" tooltip="This is a tooltip">Hover me</Button>
          <Button size="lg" variant="outline" tooltip="Another tooltip">Hover me too</Button>
        </div>
      </section>
      
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">As Link</h2>
        <div className="flex items-center gap-4">
            <Button href="/" variant="outline">Go Home</Button>
        </div>
      </section>
    </div>
  );
}
