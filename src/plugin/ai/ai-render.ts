const ai = {
  structure: {
    MainPage: {
      type: 'frame',
      width: 1280,
      height: 'auto',
      direction: 'VERTICAL',
      verticalPadding: 20,
      horizontalPadding: 20,
      horizontalAlign: 'CENTER',
      verticalAlign: 'TOP',
      gap: 20,
      Header: {
        type: 'frame',
        width: 1280,
        height: 100,
        backgroundColor: '#FFFFFF',
        direction: 'HORIZONTAL',
        gap: 10,
        Logo: {
          type: 'component',
          name: 'Logo',
        },
        MenuItems: {
          type: 'component',
          name: 'Menu Items',
        },
      },
      MainContent: {
        type: 'frame',
        width: 1280,
        height: 'auto',
        direction: 'VERTICAL',
        gap: 15,
        CompanyCards: {
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
      },
      Sidebar: {
        type: 'frame',
        width: 280,
        height: 'auto',
        direction: 'VERTICAL',
        gap: 10,
        InfoBlock: {
          type: 'component',
          name: 'Title + Description block',
        },
        Chips: {
          type: 'component',
          name: 'Chips',
        },
        DropdownMenu: {
          type: 'component',
          name: 'Dropdown Menu Elements',
        },
      },
      Footer: {
        type: 'frame',
        width: 1280,
        height: 50,
        backgroundColor: '#F0F0F0',
        direction: 'HORIZONTAL',
        gap: 10,
        Links: {
          type: 'component',
          name: 'Link',
        },
        LogoEmailTransition: {
          type: 'component',
          name: 'Logo Email Transition',
        },
      },
    },
    ProfilePage: {
      type: 'frame',
      width: 1280,
      height: 'auto',
      direction: 'VERTICAL',
      gap: 20,
      Header: {
        type: 'frame',
        width: 1280,
        height: 100,
        direction: 'HORIZONTAL',
        gap: 10,
        Logo: {
          type: 'component',
          name: 'Logo',
        },
        Menu: {
          type: 'frame',
          width: 400,
          height: 100,
          direction: 'HORIZONTAL',
          gap: 5,
          MenuItems: {
            type: 'component',
            name: 'Menu Items',
          },
        },
      },
      MainContent: {
        type: 'frame',
        width: 1280,
        height: 'auto',
        direction: 'VERTICAL',
        gap: 15,
        ProfileBlock: {
          type: 'component',
          name: 'Profile',
        },
        SocialMediaIcons: {
          type: 'component',
          name: 'Icon Only Buttons',
        },
        Description: {
          type: 'component',
          name: 'Txt Block',
        },
      },
      Footer: {
        type: 'frame',
        width: 1280,
        height: 50,
        direction: 'HORIZONTAL',
        gap: 10,
      },
    },
  },
}
import { createFrame, createText } from '@src/plugin/helpers'

const findInstance = (name: string): InstanceNode | undefined => {
  const componentOrSet = figma.root.findOne((n) => n.name === name)

  if (componentOrSet) {
    console.log(`Found: ${componentOrSet.name}`, componentOrSet, componentOrSet.type)

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
}

const renderBlocks = (node: any, key = '', parentElement: any) => {
  let newElement
  console.log('Rendering:', node, key, parentElement)
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
            console.log('Changing text', child, node.label)
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
  const data = ai.structure
  console.log('Rendering AI:', data)
  Object.keys(data).forEach((page) => {
    console.log(`Rendering page: ${page}`)
    renderBlocks(data[page], page, element)
  })
}
