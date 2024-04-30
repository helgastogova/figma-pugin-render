const ai = {
  MainPage: {
    type: 'frame',
    name: 'Main Page',
    width: 1280,
    height: 'auto',
    direction: 'VERTICAL',
    horizontalPadding: 20,
    verticalPadding: 20,
    itemSpacing: 10,
    backgroundColor: '#F0F0F0',
    Header: {
      type: 'frame',
      name: 'Header',
      width: 1280,
      height: 100,
      backgroundColor: '#FFFFFF',
      direction: 'HORIZONTAL',
      horizontalAlign: 'SPACE_BETWEEN',
      verticalAlign: 'CENTER',
      horizontalPadding: 15,
      verticalPadding: 10,
      itemSpacing: 10,
      Logo: {
        type: 'component',
        name: 'Logo',
      },
      Search: {
        type: 'component',
        name: 'Search',
      },
      Menu: {
        type: 'frame',
        name: 'Navigation Menu',
        width: 500,
        height: 100,
        direction: 'HORIZONTAL',
        itemSpacing: 5,
        MenuItems: {
          type: 'component',
          name: 'Menu Items',
        },
      },
      Link: {
        type: 'component',
        name: 'Link',
        label: 'Profile',
      },
    },
    HeroSection: {
      type: 'frame',
      name: 'Hero Section',
      direction: 'VERTICAL',
      width: 1280,
      height: 300,
      horizontalPadding: 20,
      verticalPadding: 20,
      backgroundColor: '#E0E0E0',
      Title: {
        type: 'text',
        name: 'Headings',
        textContent: 'Empowering Community Innovation',
      },
      Subtitle: {
        type: 'text',
        name: 'Subtitle',
        textContent:
          'Welcome to our community! Explore, connect, and grow with us as we build a brighter future together.',
      },
    },
    MainContent: {
      type: 'frame',
      name: 'Main Content',
      width: 1280,
      height: 'auto',
      direction: 'VERTICAL',
      horizontalPadding: 15,
      verticalPadding: 15,
      itemSpacing: 15,
      'Company Cards': {
        type: 'component',
        name: 'Company Cards',
      },
      MediaBlocks: {
        type: 'component',
        name: 'Media',
      },
      Accordion: {
        type: 'component',
        name: 'Accordeon',
      },
      CommunityTags: {
        type: 'component',
        name: 'Community Tags',
      },
      CommunityText: {
        type: 'text',
        textContent:
          'Our community thrives on collaboration and innovation. Here, you can find the latest projects and initiatives to get involved with.',
      },
    },
    Footer: {
      type: 'frame',
      name: 'Footer',
      width: 1280,
      height: 50,
      backgroundColor: '#D0D0D0',
      direction: 'HORIZONTAL',
      horizontalAlign: 'SPACE_BETWEEN',
      verticalAlign: 'CENTER',
      horizontalPadding: 20,
      verticalPadding: 10,
      itemSpacing: 10,
      ContactLink: {
        type: 'component',
        name: 'Link',
        label: 'Contact Us',
      },
      LogoEmailTransition: {
        type: 'component',
        name: 'Logo Email Transition',
      },
      FooterText: {
        type: 'text',
        textContent: '© 2024 Founder Community. All rights reserved.',
      },
    },
  },
  CommunityPage: {
    type: 'frame',
    name: 'Community Page',
    width: 1200,
    height: 'auto',
    direction: 'HORIZONTAL',
    horizontalPadding: 20,
    verticalPadding: 20,
    itemSpacing: 20,
    MainSection: {
      type: 'frame',
      name: 'Main Section',
      direction: 'VERTICAL',
      width: 900,
      height: 'auto',
      horizontalPadding: 20,
      verticalPadding: 20,
      itemSpacing: 20,
      Header: {
        type: 'frame',
        name: 'Header',
        direction: 'HORIZONTAL',
        horizontalAlign: 'MIN',
        itemSpacing: 10,
        Logo: {
          type: 'component',
          name: 'Logo',
        },
        Search: {
          type: 'component',
          name: 'Search',
        },
        Profile: {
          type: 'component',
          name: 'Profile',
        },
      },
      PostFeed: {
        type: 'frame',
        name: 'Post Feed',
        direction: 'VERTICAL',
        itemSpacing: 10,
        PostItem: {
          type: 'frame',
          name: 'Post Item',
          direction: 'VERTICAL',
          itemSpacing: 5,
          PostHeader: {
            type: 'frame',
            name: 'Post Header',
            direction: 'HORIZONTAL',
            horizontalAlign: 'MIN',
            itemSpacing: 5,
            Avatar: {
              type: 'component',
              name: 'Profile',
            },
            PostInfo: {
              type: 'text',
              textContent: 'Blessing Mikauru - Ovoda AI, billing solution...',
            },
          },
          PostContent: {
            type: 'text',
            textContent: 'Over the past couple of weeks, I have largely been...',
          },
          Tags: {
            type: 'component',
            name: 'Chips',
          },
          PostActions: {
            type: 'frame',
            name: 'Post Actions',
            direction: 'HORIZONTAL',
            itemSpacing: 5,
            LikeButton: {
              type: 'component',
              name: 'Icon Only Buttons',
            },
            CommentButton: {
              type: 'component',
              name: 'Icon Only Buttons',
            },
          },
        },
      },
    },
    PostFeed: {
      type: 'frame',
      name: 'Post Feed',
      direction: 'VERTICAL',
      itemSpacing: 16,
      backgroundColor: '#FFFFFF',
      horizontalPadding: 16,
      verticalPadding: 16,
      PostItem: {
        type: 'frame',
        name: 'Post Item',
        direction: 'VERTICAL',
        itemSpacing: 12,
        horizontalPadding: 16,
        verticalPadding: 16,
        backgroundColor: '#F0F0F0',
        PostHeader: {
          type: 'frame',
          name: 'Post Header',
          direction: 'HORIZONTAL',
          horizontalAlign: 'MIN',
          itemSpacing: 12,
          Avatar: {
            type: 'component',
            name: 'Profile',
          },
          PostInfo: {
            type: 'text',
            textContent: 'Blessing Mikauru - Ovoda AI, billing solution...',
          },
        },
        PostContent: {
          type: 'text',
          textContent: 'Over the past couple of weeks, I have largely been...',
        },
        Tags: {
          type: 'component',
          name: 'Chips',
        },
        PostActions: {
          type: 'frame',
          name: 'Post Actions',
          direction: 'HORIZONTAL',
          itemSpacing: 8,
          LikeButton: {
            type: 'component',
            name: 'Icon Only Buttons',
          },
          CommentButton: {
            type: 'component',
            name: 'Icon Only Buttons',
          },
        },
      },
    },

    Sidebar: {
      type: 'frame',
      name: 'Sidebar',
      direction: 'VERTICAL',
      width: 300,
      height: 'auto',
      horizontalPadding: 24,
      verticalPadding: 24,
      itemSpacing: 24,
      backgroundColor: '#FFFFFF',
      Events: {
        type: 'frame',
        name: 'Events',
        direction: 'VERTICAL',
        itemSpacing: 16,
        backgroundColor: '#E8E8E8',
        horizontalPadding: 16,
        verticalPadding: 16,
        EventItem: {
          type: 'text',
          textContent: '"NO VC" ODF Showcase...',
        },
      },
    },
  },
}

import { createFrame, createText } from '@src/plugin/helpers'

const findInstance = (name: string): InstanceNode | undefined => {
  const componentOrSet = figma.root.findOne((n) => n.name === name)

  if (componentOrSet) {
    if (componentOrSet.type === 'INSTANCE') return componentOrSet
    if (componentOrSet.type === 'COMPONENT_SET') {
      const component = componentOrSet?.children[0]
      if (component?.type === 'COMPONENT') {
        return component.createInstance()
      }
    } else if (componentOrSet.type === 'COMPONENT') {
      return componentOrSet.createInstance()
    }
  }
  return undefined
}

const renderBlocks = (node: any, key = '', parentElement: any) => {
  let newElement
  switch (node.type) {
    case 'text':
      parentElement.appendChild(createText({ name: key, characters: node.textContent }))
      break
    case 'frame':
      newElement = createFrame(
        {
          name: key,
          minWidth: node.width ?? null,
          backgroundColor: node.backgroundColor,
          direction: node.direction,
          itemSpacing: node.itemSpacing,
          verticalPadding: node.verticalPadding,
          horizontalPadding: node.horizontalPadding,
          horizontalAlign: node.horizontalAlign,
          verticalAlign: node.verticalAlign,
        },
        parentElement,
      )
      break
    case 'component':
      const component = findInstance(node.name)
      // изменить текст компонента (код говно надо нормально менять)
      if (node.label) {
        component?.children.forEach((child) => {
          if (child.type === 'TEXT') {
            child.characters = node.label
          }
        })
      }

      if (component) parentElement.appendChild(component)

      break
    default:
      console.error(`Unknown node type: ${node.type}`)
      return
  }

  Object.keys(node).forEach((key) => {
    if (typeof node[key] === 'object') {
      renderBlocks(node[key], key, newElement ?? parentElement)
    }
  })
}

export const renderAI = async (element) => {
  Object.keys(ai).forEach((page) => {
    renderBlocks(ai[page], page, element)
  })
}
