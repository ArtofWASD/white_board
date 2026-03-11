const fs = require('fs');
const path = require('path');

const mappings = {
  '@/components/ui/badge': '@/components/ui/Badge',
  '@/components/ui/checkbox': '@/components/ui/Checkbox',
  '@/components/ui/dialog': '@/components/ui/Dialog',
  '@/components/ui/hover-card': '@/components/ui/HoverCard',
  '@/components/ui/label': '@/components/ui/Label',
  '@/components/ui/popover': '@/components/ui/Popover',
  '@/components/ui/radio-group': '@/components/ui/RadioGroup',
  '@/components/ui/select': '@/components/ui/Select',
  '@/components/ui/textarea': '@/components/ui/Textarea',
};

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.next') {
        processDir(fullPath);
      }
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;
      
      for (const [oldKey, newKey] of Object.entries(mappings)) {
        // match exact import strings: from "@/components/ui/badge" or from '@/components/ui/badge'
        const regex1 = new RegExp(`from "${oldKey}"`, 'g');
        const regex2 = new RegExp(`from '${oldKey}'`, 'g');
        if (regex1.test(content)) {
          content = content.replace(regex1, `from "${newKey}"`);
          changed = true;
        }
        if (regex2.test(content)) {
          content = content.replace(regex2, `from '${newKey}'`);
          changed = true;
        }
      }
      
      if (changed) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated: ${fullPath}`);
      }
    }
  }
}

processDir(path.join(__dirname, 'src'));
