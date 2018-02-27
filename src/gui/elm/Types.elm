module Types exposing (..)

import Browse.Types
import Breadcrumb.Types

type alias Model =
    { browse : Browse.Types.Model
    , breadcrumb : Breadcrumb.Types.Model
    }

type Msg
    = Browse Browse.Types.Msg
    | Breadcrumb Breadcrumb.Types.Msg
