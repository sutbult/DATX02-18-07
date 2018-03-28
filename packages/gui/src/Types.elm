module Types exposing (..)

import Navigation.Types

type alias Model =
    { navigation : Navigation.Types.Model
    }

type Msg
    = ToNavigation Navigation.Types.Msg
