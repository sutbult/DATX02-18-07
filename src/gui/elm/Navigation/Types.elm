module Navigation.Types exposing (..)

import Browse.Types
import Add.Types
import Wallet.Types

type View
    = Browse
    | Add
    | Wallet

type alias Model =
    { shown : View
    , models :
        { browse : Browse.Types.Model
        , add : Add.Types.Model
        , wallet : Wallet.Types.Model
        }
    }

type Msg
    = Show View
    | ToBrowse Browse.Types.Msg
    | ToAdd Add.Types.Msg
    | ToWallet Wallet.Types.Msg
