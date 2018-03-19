module Navigation.Types exposing (..)

import Browse.Types

type View
    = Browse
    | Add

type alias Model =
    { shown : View
    , models :
        { browse : Browse.Types.Model
        }
    }

type Msg
    = Show View
    | ToBrowse Browse.Types.Msg
