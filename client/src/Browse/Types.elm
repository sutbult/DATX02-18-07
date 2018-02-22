module Browse.Types exposing (..)

import Browse.Filter.Types

type alias Model =
    { filter : Browse.Filter.Types.Model
    }

type Msg =
    Filter Browse.Filter.Types.Msg
