import React from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Label } from '@/components/ui/label';

const modules = {
  toolbar: [
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'indent': '-1'}, { 'indent': '+1' }],
    [{ 'align': [] }],
    ['link', 'image'],
    ['clean']
  ]
};

const formats = [
  'header', 'bold', 'italic', 'underline', 'strike',
  'color', 'background', 'list', 'bullet', 'indent',
  'align', 'link', 'image'
];

export default function RichTextEditor({ 
  value, 
  onChange, 
  label, 
  placeholder = "Digite o conteúdo...",
  height = "200px" 
}) {
  return (
    <div className="space-y-2">
      {label && <Label className="text-base font-medium">{label}</Label>}
      <div style={{ height: height }}>
        <ReactQuill
          value={value || ''}
          onChange={onChange}
          modules={modules}
          formats={formats}
          placeholder={placeholder}
          style={{ height: 'calc(100% - 42px)' }}
        />
      </div>
    </div>
  );
}