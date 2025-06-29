// @ts-nocheck
import React from 'react';

interface GalleryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  items: any[];
}

export const GalleryPanel: React.FC<GalleryPanelProps> = ({ isOpen, onClose, items }) => {
  if (!isOpen) return null;

  return React.createElement('div', {
    className: 'fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center p-4',
    onClick: onClose
  },
    React.createElement('div', {
      className: 'bg-slate-50 rounded-lg shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col',
      onClick: e => e.stopPropagation()
    },
      React.createElement('header', {
        className: 'flex justify-between items-center p-4 border-b border-slate-200'
      },
        React.createElement('h2', {
          className: 'text-xl font-bold text-slate-800'
        }, 'ギャラリー'),
        React.createElement('button', {
          onClick: onClose,
          className: 'p-2 hover:bg-slate-200 rounded-full'
        }, '✕')
      ),
      React.createElement('div', {
        className: 'p-6 overflow-y-auto'
      },
        items.length === 0 ? 
          React.createElement('p', {
            className: 'text-slate-500'
          }, 'まだアンロックされたイベントCGはありません。') :
          React.createElement('div', {
            className: 'grid grid-cols-2 md:grid-cols-3 gap-4'
          },
            items.map(item => 
              React.createElement('div', {
                key: item.id,
                className: 'border rounded-lg overflow-hidden shadow-sm group cursor-pointer'
              },
                React.createElement('img', {
                  src: item.imageUrl,
                  alt: item.title,
                  className: 'w-full h-40 object-cover'
                }),
                React.createElement('div', {
                  className: 'p-3'
                },
                  React.createElement('h4', {
                    className: 'font-bold text-slate-700'
                  }, item.title),
                  React.createElement('p', {
                    className: 'text-sm text-slate-500'
                  }, item.description)
                )
              )
            )
          )
      )
    )
  );
};