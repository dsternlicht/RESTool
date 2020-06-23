
const imageDisplay = {
  dataPath: 'image.original',
  type: 'image'
};

const showDisplayFields = [
  {
    name: 'name',
    type: 'text',
    label: 'Name'
  },
  {
    name: 'type',
    type: 'text',
    label: 'Type'
  },
  {
    name: 'status',
    type: 'text',
    label: 'Status'
  },
  {
    name: 'premiered',
    type: 'text',
    label: 'Premiered'
  },
  {
    dataPath: 'rating.average',
    type: 'text',
    label: 'Rating'
  },
];


const showDetailFields = [
  imageDisplay,
  ...showDisplayFields,
  {
    name: 'officialSite',
    type: 'url',
    label: 'Official Website'
  },
  {
    name: 'summary',
    type: 'html',
    label: 'Summary'
  },
];

const creditsDisplayFields = [
  {
    name: 'name',
    type: 'text',
    label: 'Show'
  },
  {
    name: 'type',
    type: 'text',
    label: 'Type'
  },
  {
    name: 'status',
    type: 'text',
    label: 'Status'
  },
  {
    name: 'premiered',
    type: 'text',
    label: 'Premiered'
  },
  {
    dataPath: 'rating.average',
    type: 'text',
    label: 'Rating'
  },
];


const personCredits = {
  name: 'Credits',
  id: 'people/:id/credits',
  subResources: [],
  methods: {
    getAll: {
      url: '/people/:id/castcredits',
      dataTransform: items => items.map(result => result._embedded?.show),
      dataPath: '',
      queryParams: [{
        name: 'embed',
        type: 'hidden',
        value: 'show'
      }],
      display: {
        type: 'table'
      },
      fields: creditsDisplayFields,
    },
  }
}



const peopleDisplayFields = [
  imageDisplay,
  {
    name: 'name',
    type: 'text',
    label: 'Name'
  },
  {
    name: 'birthday',
    type: 'text',
    label: 'Birthday'
  },
  {
    dataPath: 'country.name',
    type: 'text',
    label: 'Country'
  },
];

const getSinglePeople = {
  id: 'people/:id',
  name: ':name',
  url: '/people/:id',
  fields: peopleDisplayFields,
}

const people = {
  name: 'People',
  id: 'people',
  description: 'Search in all the people!',
  subResources: [personCredits],
  methods: {
    getAll: {
      url: '/search/people',
      dataTransform: items => items.map(result => result.person),
      dataPath: '',
      queryParams: [{
        name: 'q',
        type: 'text',
        label: 'Search',
        value: 'Smith'
      }],
      display: {
        type: 'cards'
      },
      fields: peopleDisplayFields
    },
    getSingle: getSinglePeople,
  }
}


const shows = {
  name: 'Shows',
  id: 'shows',
  description: 'All TV shows!',
  subResources: [],
  methods: {
    getAll: {
      url: '/shows',
      dataPath: '',
      display: {
        type: 'table'
      },
      fields: showDisplayFields,
      pagination: {
        source: 'query',
        type: 'infinite-scroll',
        params: {
          limit: {
            name: 'limit',
            value: '250'
          },
          page: {
            name: 'page',
            value: '0'
          },
        },
      },
    },
    getSingle: {
      id: 'shows/:id',
      name: ':name',
      url: '/shows/:id',
      fields: showDetailFields,
    },
  }
};


const episodesDisplayFields = [
  {
    name: 'number',
    type: 'text',
    label: 'Number'
  },
  {
    name: 'name',
    type: 'text',
    label: 'Name'
  },
  {
    name: 'airdate',
    type: 'text',
    label: 'First aired'
  },
];

const seasonEpisodes = {
  name: 'Episodes',
  id: 'seasons/:id/episodes',
  description: 'All season episodes!',
  methods: {
    getAll: {
      url: '/seasons/:id/episodes',
      dataPath: '',
      display: {
        type: 'table'
      },
      fields: episodesDisplayFields
    },
    getSingle: {
      id: 'episodes/:id',
      url: '/episodes/:id',
      name: ':name',
      fields: [
        imageDisplay,
        ...episodesDisplayFields,
        {
          name: 'summary',
          type: 'html',
          label: 'Summary'
        },
      ],
    },
  }
}

const seasonsDisplayFields = [
  {
    name: 'number',
    type: 'text',
    label: 'Number'
  },
  {
    name: 'name',
    type: 'text',
    label: 'Name'
  },
  {
    name: 'premiereDate',
    type: 'text',
    label: 'Premiere Date'
  },
  {
    name: 'endDate',
    type: 'text',
    label: 'End Date'
  },
  {
    name: 'episodeOrder',
    type: 'text',
    label: '# episodes',
  },
];

const showSeasons = {
  name: 'Seasons',
  id: 'shows/:id/seasons',
  description: 'All seasons!',
  subResources: [seasonEpisodes],
  methods: {
    getAll: {
      url: '/shows/:id/seasons',
      dataPath: '',
      display: {
        type: 'table'
      },
      fields: seasonsDisplayFields
    },
    getSingle: {
      name: 'Season :number',
      id: 'seasons/:id',
      url: '/seasons/:id',
      fields: seasonsDisplayFields,
    },
  }
};
shows.subResources.push(showSeasons);


const showCast = {
  name: 'Cast',
  id: 'shows/:id/cast',
  description: 'Cast',
  subResources: [],
  methods: {
    getAll: {
      url: '/shows/:id/cast',
      dataTransform: items => items.map(result => result.person),
      dataPath: '',
      display: {
        type: 'cards'
      },
      fields: peopleDisplayFields
    },
    getSingle: getSinglePeople,
  }
};
shows.subResources.push(showCast);

const crewDisplayFields = [
  {
    name: 'type',
    type: 'text',
    label: 'Role',
  },
  {
    name: 'name',
    type: 'text',
    label: 'Name'
  },
];

const showCrew = {
  name: 'Crew',
  id: 'shows/:id/crew',
  description: 'Crew',
  subResources: [],
  methods: {
    getAll: {
      url: '/shows/:id/crew',
      dataTransform: items => items.map(result => ({ ...result.person, type: result.type })),
      dataPath: '',
      display: {
        type: 'table'
      },
      fields: crewDisplayFields
    },
    getSingle: getSinglePeople,
  }
};
shows.subResources.push(showCrew);


const resources = [
  shows,
  people,
];

const config = {
  name: 'TV Maze',
  baseUrl: 'http://api.tvmaze.com',
  resources,
};

export default config;
