module Navigation.Types exposing (..)

import Browse.Types
import Add.Types

type View
    = Browse
    | Add

type alias Model =
    { shown : View
    , models :
        { browse : Browse.Types.Model
        , add : Add.Types.Model
        }
    }

type Msg
    = Show View
    | ToBrowse Browse.Types.Msg
    | ToAdd Add.Types.Msg
