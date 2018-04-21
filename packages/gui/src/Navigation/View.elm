module Navigation.View exposing (root)

import Html exposing (..)
import Html.Events exposing (..)
import Html.Attributes exposing (..)

import Navigation.Types exposing (..)

import Browse.View
import Add.View
import Wallet.View
import UserBids.View
import AcceptedBids.View
import Settings.View

import Utils.List exposing
    ( singletonWhen
    )


views : List (View, String)
views =
    [ (Add, "Add bid")
    , (Browse, "Browse bids")
    , (Wallet, "Your wallets")
    , (UserBids, "Your bids")
    , (AcceptedBids, "Accepted bids")
    , (Settings, "Settings")
    ]


root : Model -> Html Msg
root model =
    div [class "columns"]
        [ div [class "column is-narrow"]
            [ menu model
            ]
        , div [class "column"]
            [ viewSelector model
            ]
        ]


menu : Model -> Html Msg
menu model =
    let
        option (view, title) =
            let
                attribs =
                    (++)
                        [onClick (Show view)]
                        <| singletonWhen
                            (model.shown == view)
                            (class "is-active")
            in
                li []
                    [ a attribs
                        [ text title
                        ]
                    ]
    in
        aside [class "menu"]
            [ ul [class "menu-list"]
                <| List.map option views
            ]


viewSelector : Model -> Html Msg
viewSelector model =
    case model.shown of
        Browse ->
            Html.map mapBrowse <| Browse.View.root model.models.browse

        Add ->
            Html.map mapAdd <| Add.View.root model.models.add

        Wallet ->
            Html.map ToWallet <| Wallet.View.root model.models.wallet

        UserBids ->
            Html.map mapUserBids <| UserBids.View.root model.models.userBids

        AcceptedBids ->
            Html.map ToAcceptedBids <| AcceptedBids.View.root model.models.acceptedBids

        Settings ->
            Html.map ToSettings <| Settings.View.root model.models.settings
