// Welcome to your schema
//   Schema driven development is Keystone's modus operandi
//
// This file is where we define the lists, fields and hooks for our data.
// If you want to learn more about how lists are configured, please read
// - https://keystonejs.com/docs/config/lists

import { list } from "@keystone-6/core";
import { allowAll } from "@keystone-6/core/access";

// see https://keystonejs.com/docs/fields/overview for the full list of fields
//   this is a few common fields for an example
import {
  text,
  relationship,
  password,
  timestamp,
  select,
  integer,
  checkbox,
} from "@keystone-6/core/fields";

// the document field is a more complicated field, so it has it's own package
import { document } from "@keystone-6/fields-document";
// if you want to make your own fields, see https://keystonejs.com/docs/guides/custom-fields

// when using Typescript, you can refine your types to a stricter subset by importing
// the generated types from './generated/keystone/types'
import type { Lists } from "./generated/keystone/types";

export const lists = {
  User: list({
    // WARNING
    //   for this starter project, anyone can create, query, update and delete anything
    //   if you want to prevent random people on the internet from accessing your data,
    //   you can find out more at https://keystonejs.com/docs/guides/auth-and-access-control
    access: allowAll,

    // this is the fields for our User list
    fields: {
      // by adding isRequired, we enforce that every User should have a name
      //   if no name is provided, an error will be displayed
      name: text({ validation: { isRequired: true } }),

      email: text({
        validation: { isRequired: true },
        // by adding isIndexed: 'unique', we're saying that no user can have the same
        // email as another user - this may or may not be a good idea for your project
        isIndexed: "unique",
      }),

      password: password({ validation: { isRequired: true } }),

      // we can use this field to see what Posts this User has authored
      //   more on that in the Post list below
      posts: relationship({ ref: "Post.author", many: true }),

      createdAt: timestamp({
        // this sets the timestamp to Date.now() when the user is first created
        defaultValue: { kind: "now" },
      }),
    },
  }),


  Post: list({
    // WARNING
    //   for this starter project, anyone can create, query, update and delete anything
    //   if you want to prevent random people on the internet from accessing your data,
    //   you can find out more at https://keystonejs.com/docs/guides/auth-and-access-control
    access: allowAll,

    // this is the fields for our Post list
    fields: {
      title: text({ validation: { isRequired: true } }),

      // the document field can be used for making rich editable content
      //   you can find out more at https://keystonejs.com/docs/guides/document-fields
      content: document({
        formatting: true,
        layouts: [
          [1, 1],
          [1, 1, 1],
          [2, 1],
          [1, 2],
          [1, 2, 1],
        ],
        links: true,
        dividers: true,
      }),

      // with this field, you can set a User as the author for a Post
      author: relationship({
        // we could have used 'User', but then the relationship would only be 1-way
        ref: "User.posts",

        // this is some customisations for changing how this will look in the AdminUI
        ui: {
          displayMode: "cards",
          cardFields: ["name", "email"],
          inlineEdit: { fields: ["name", "email"] },
          linkToItem: true,
          inlineConnect: true,
        },

        // a Post can only have one author
        //   this is the default, but we show it here for verbosity
        many: false,
      }),

      // with this field, you can add some Tags to Posts
      tags: relationship({
        // we could have used 'Tag', but then the relationship would only be 1-way
        ref: "Tag.posts",

        // a Post can have many Tags, not just one
        many: true,

        // this is some customisations for changing how this will look in the AdminUI
        ui: {
          displayMode: "cards",
          cardFields: ["name"],
          inlineEdit: { fields: ["name"] },
          linkToItem: true,
          inlineConnect: true,
          inlineCreate: { fields: ["name"] },
        },
      }),
    },
  }),

  // this last list is our Tag list, it only has a name field for now
  Tag: list({
    // WARNING
    //   for this starter project, anyone can create, query, update and delete anything
    //
    //   if you want to prevent random people on the internet from accessing your data,
    //   you can find out more at https://keystonejs.com/docs/guides/auth-and-access-control
    access: allowAll,

    // dont show this list in the AdminUI
    ui: {
      hideNavigation: true,
    },

    // this is the fields for our Tag list
    fields: {
      name: text(),
      // this can be helpful to find out all the Posts associated with a Tag
      posts: relationship({ ref: "Post.tags", many: true }),
    },
  }),

  Profile: list({
    access: allowAll,
    ui: {
      label: 'Profiles',
      hideCreate: false,
    },
    fields: {
      sureName: text({ validation: { isRequired: true } }),
      imageUrl: text(),
      requestCV: text(),
      professionTexts: text({ list: true }),

      experienceYears: integer(),
      experienceTitle: text(),
      experienceDescription: text({ ui: { displayMode: 'textarea' } }),

      workPermitTitle: text(),
      workPermitDescription: text({ ui: { displayMode: 'textarea' } }),

      aboutImages: text({ list: true }),
      interestsTitle: text(),
      interestsDescription: text({ ui: { displayMode: 'textarea' } }),
      interestsAreas: text({ list: true }),

      skills: relationship({ ref: 'Skill.profile', many: true }),
      experiences: relationship({ ref: 'Experience.profile', many: true }),
      educations: relationship({ ref: 'Education.profile', many: true }),
      certificates: relationship({ ref: 'Certificate.profile', many: true }),
      articles: relationship({ ref: 'Article.profile', many: true }),
      hireMe: relationship({ ref: 'HireMe.profile', many: true }),
      serviceItems: relationship({ ref: 'Service.profile', many: true }),
      projectCategories: relationship({ ref: 'ProjectCategory.profile', many: true }),
      projects: relationship({ ref: 'Project.profile', many: true }),
      socialLinks: relationship({ ref: 'SocialLink.profile', many: true }),
      personalInfos: relationship({ ref: 'PersonalInfo.profile', many: true }),
      freelanceLinks: relationship({ ref: 'FreelanceLink.profile', many: true }),
      contactInfos: relationship({ ref: 'ContactInfo.profile', many: true }),
      copyright: relationship({ ref: 'Copyright.profile', many: false }),
    },
  }),

  Skill: list({
    access: allowAll,
    fields: {
      category: select({
        options: [
          { label: 'Frontend', value: 'FRONTEND' },
          { label: 'Backend', value: 'BACKEND' },
        ],
        validation: { isRequired: true },
      }),
      label: text({ validation: { isRequired: true } }),
      value: integer({ validation: { min: 0, max: 100 } }),
      color: text(),
      profile: relationship({ ref: 'Profile.skills', many: false }),
    },
  }),

  Experience: list({
    access: allowAll,
    fields: {
      title: text({ validation: { isRequired: true } }),
      date: text(),
      company: text(),
      profile: relationship({ ref: 'Profile.experiences', many: false }),
    },
  }),

  Education: list({
    access: allowAll,
    fields: {
      title: text({ validation: { isRequired: true } }),
      date: text(),
      location: text(),
      profile: relationship({ ref: 'Profile.educations', many: false }),
    },
  }),

  Certificate: list({
    access: allowAll,
    fields: {
      title: text({ validation: { isRequired: true } }),
      issuer: text(),
      date: text(),
      imageUrl: text(),
      link: text(),
      profile: relationship({ ref: 'Profile.certificates', many: false }),
    },
  }),

  Article: list({
    access: allowAll,
    fields: {
      title: text({ validation: { isRequired: true } }),
      excerpt: text({ ui: { displayMode: 'textarea' } }),
      description: text({ ui: { displayMode: 'textarea' } }),
      author: text(),
      readTime: text(),
      imageUrl: text(),
      link: text(),
      profile: relationship({ ref: 'Profile.articles', many: false }),
    },
  }),

  HireMe: list({
    access: allowAll,
    fields: {
      title: text({ validation: { isRequired: true } }),
      link: text(),
      profile: relationship({ ref: 'Profile.hireMe', many: false }),
    },
  }),

  Service: list({
    access: allowAll,
    fields: {
      category: text({ validation: { isRequired: true } }),
      iconFont: text(),
      descriptions: text({ list: true }),
      profile: relationship({ ref: 'Profile.serviceItems', many: false }),
    },
  }),

  ProjectCategory: list({
    access: allowAll,
    fields: {
      category: text({ validation: { isRequired: true } }),
      class: text(),
      project: relationship({ ref: 'Project.class', many: true }),
      profile: relationship({ ref: 'Profile.projectCategories', many: false }),
    },
  }),

  Project: list({
    access: allowAll,
    fields: {
      // class: text({ list: true }),
      class: relationship({ ref: 'ProjectCategory.project', many: false }),
      placeHolder: text(),
      src: text(),
      alt: text(),
      url: text(),
      profile: relationship({ ref: 'Profile.projects', many: false }),
      // projects: relationship({ ref: 'Project.profile', many: true }),
    },
  }),

  SocialLink: list({
    access: allowAll,
    fields: {
      name: text({ validation: { isRequired: true } }),
      url: text({ validation: { isRequired: true } }),
      iconName: text(),
      ariaLabel: text(),
      profile: relationship({ ref: 'Profile.socialLinks', many: false }),
    },
  }),

  PersonalInfo: list({
    access: allowAll,
    fields: {
      title: text({ validation: { isRequired: true } }),
      profile: relationship({ ref: 'Profile.personalInfos', many: false }),
    },
  }),

  FreelanceLink: list({
    access: allowAll,
    fields: {
      name: text({ validation: { isRequired: true } }),
      url: text({ validation: { isRequired: true } }),
      profile: relationship({ ref: 'Profile.freelanceLinks', many: false }),
    },
  }),

  ContactInfo: list({
    access: allowAll,
    fields: {
      type: text({ validation: { isRequired: true } }),
      iconName: text(),
      content: text({ validation: { isRequired: true } }),
      url: text(),
      isLink: checkbox({ defaultValue: false }),
      className: text(),
      profile: relationship({ ref: 'Profile.contactInfos', many: false }),
    },
  }),

  Copyright: list({
    access: allowAll,
    fields: {
      year: integer({ validation: { isRequired: true } }),
      website: text({ validation: { isRequired: true } }),
      url: text(),
      profile: relationship({ ref: 'Profile.copyright', many: false }),
    },
  }),
} satisfies Lists

