module Types exposing (..)

import Browse.Types

type alias Model =
    { browse : Browse.Types.Model
    }

type Msg =
    Browse Browse.Types.Msg
