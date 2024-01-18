import { css, javascript, react, c } from '../icons';
import { ogscan, oglogo, vodafone, IPA } from '../work/export';

export const skills = [
  {
    name: 'CSS',
    type: 'Frontend',
    img: css,
  },
  {
    name: 'React',
    type: 'Frontend',
    img: react,
  },
  {
    name: 'Javascript',
    type: 'Frontend',
    img: javascript,
  },
  {
    name: 'C++',
    type: 'Backend',
    img: c,
  },
];

export const experience = [
  {
    title: 'Game Developer',
    name_company: 'Oldgodsmt2, Finalstandmt2',
    date: '2011-2012 & 2023-2024',
    info: 'Solo development of game server and constantly updating systems, developing gameplay , managing promotions, IT support, game tester',
    imgUrl: oglogo,
  },
  {
    title: '2nd Level Technician',
    name_company: 'Vodafone',
    date: '2022-present',
    info: 'Customer support, Managing & directing a customers technical issue for the fastest way possible to a solution',
    imgUrl: vodafone,
  },
  {
    title: 'Video/Graphic designer',
    name_company: 'Hobby',
    date: '2010-present',
    info: 'Something i always did for fun if someone needs something simple - using only sony vegas',
    imgUrl: oglogo,
  },
  {
    title: 'Nightclub maître',
    name_company: 'First class parties , international parties Athens',
    date: '2018-2022',
    info: 'Team management & customer experience',
    imgUrl: IPA,
  },
];
